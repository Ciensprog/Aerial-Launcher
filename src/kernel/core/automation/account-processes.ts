import type { MatchmakingTrack } from '../../../types/data/advanced-mode/matchmaking'
import type { AccountData } from '../../../types/accounts'
import type { MatchMakingData } from '../../../types/events'

import { PartyState } from '../../../config/fortnite/events'

import { AccountsManager } from '../../../kernel/startup/accounts'
import { Automation } from '../../../kernel/startup/automation'
import { SettingsManager } from '../../../kernel/startup/settings'
import { Authentication } from '../authentication'
import { ClaimRewards } from '../claim-rewards'
import { Party } from '../party'

import { findPlayer } from '../../../services/endpoints/matchmaking'
import { MCPStorageTransfer } from '../mcp/storage-transfer'

export class AccountProcess {
  private _accountId: string
  private account: AccountData

  private _matchmaking: MatchMakingData = {
    partyState: null,
    started: false,
  }
  private _startedTracking = false

  private missionIntervalId: NodeJS.Timeout | null = null
  private missionTimeout: NodeJS.Timeout | null = null

  constructor(config: { accessToken: string; account: AccountData }) {
    this._accountId = config.account.accountId
    this.account = config.account
  }

  get accountId() {
    return this._accountId
  }

  get matchmaking() {
    return this._matchmaking
  }

  get startedTracking() {
    return this._startedTracking
  }

  setMatchmaking(
    config: Partial<{
      partyState: PartyState | null
      started: boolean
    }> | null
  ) {
    if (config === null) {
      this._matchmaking.partyState = null
      this._matchmaking.started = false

      return
    }

    if (config.partyState !== undefined) {
      this._matchmaking.partyState = config.partyState
    }

    if (config.started !== undefined) {
      this._matchmaking.started = config.started
    }
  }

  setStartedTracking(value: boolean) {
    this._startedTracking = value
  }

  preInit(
    config?: Partial<{
      timeout: number
    }>
  ) {
    if (this.missionTimeout) {
      clearTimeout(this.missionTimeout)

      this.missionTimeout = null
    }

    this.missionTimeout = setTimeout(() => {
      this.initMissionInterval()
    }, config?.timeout ?? 10_000) // 10 seconds
  }

  async initMissionInterval() {
    if (this.missionIntervalId) {
      return
    }

    const settings = await SettingsManager.getData()
    const missionInterval = Number(settings.missionInterval)

    this.missionIntervalId = setInterval(async () => {
      const currentAccount = AccountsManager.getAccountById(this.accountId)
      const automationAccount = Automation.getAccountById(this.accountId)

      if (!currentAccount || !automationAccount) {
        this.clearMissionIntervalId()

        return
      }

      const accessToken = await Authentication.verifyAccessToken(
        this.account
      )

      if (!accessToken) {
        this.clearMissionIntervalId()

        return
      }

      const response = await findPlayer({
        accessToken,
        accountId: this.account.accountId,
      })
      const matchmacking: MatchmakingTrack | undefined = response.data?.[0]

      if (!matchmacking) {
        const validPartyState =
          this._matchmaking.partyState === PartyState.MATCHMAKING ||
          this._matchmaking.partyState === PartyState.POST_MATCHMAKING

        if (!validPartyState) {
          this.clearMissionIntervalId()
        }

        return
      }

      if (matchmacking.started === undefined) {
        return
      }

      if (
        this._matchmaking.partyState !== PartyState.POST_MATCHMAKING &&
        matchmacking.started
      ) {
        this.setMatchmaking({
          partyState: PartyState.POST_MATCHMAKING,
        })

        return
      }

      if (
        !(
          this._matchmaking.partyState === PartyState.POST_MATCHMAKING &&
          this._matchmaking.started &&
          !matchmacking.started
        )
      ) {
        this.setMatchmaking({
          started: matchmacking.started,
        })

        return
      }

if (automationAccount.actions.kick || automationAccount.actions.claim) {
  this.clearMissionIntervalId()

  const tasks: Promise<any>[] = []

  if (automationAccount.actions.kick) {
    const accounts = AccountsManager.getAccounts()
    tasks.push(
      Party.kickPartyMembers(
        currentAccount,
        [...accounts.values()],
        automationAccount.actions.claim ?? false,
        {
          useGlobalNotification: true,
        }
      )
    )
  }

  if (automationAccount.actions.claim) {
    tasks.push(ClaimRewards.start([currentAccount], true))
  }

  await Promise.all(tasks)

  return
}


      if (automationAccount.actions.transferMats === true) {
        this.clearMissionIntervalId()

        MCPStorageTransfer.buildingMaterials(currentAccount).catch(
          () => {}
        )
      }
    }, missionInterval * 1_000)
  }

  async checkMatchAtStartUp() {
    try {
      const accessToken = await Authentication.verifyAccessToken(
        this.account
      )

      if (!accessToken) {
        return
      }

      const response = await findPlayer({
        accessToken,
        accountId: this.account.accountId,
      })
      const matchmacking: MatchmakingTrack | undefined = response.data?.[0]

      if (
        !matchmacking ||
        (matchmacking && matchmacking.started === undefined)
      ) {
        return
      }

      this.setMatchmaking({
        partyState: matchmacking.started
          ? PartyState.POST_MATCHMAKING
          : PartyState.MATCHMAKING,
        started: matchmacking.started!,
      })
      this.initMissionInterval()

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }
  }

  clearMissionIntervalId() {
    this._startedTracking = false
    this.setMatchmaking(null)

    if (this.missionIntervalId) {
      clearInterval(this.missionIntervalId)
    }

    if (this.missionTimeout) {
      clearTimeout(this.missionTimeout)
    }

    this.missionIntervalId = null
    this.missionTimeout = null
  }
}
