import type { MatchmakingTrack } from '../../../types/data/advanced-mode/matchmaking'
import type { AccountData } from '../../../types/accounts'
import type { MatchMakingData } from '../../../types/events'

import { BrowserWindow } from 'electron'

import { PartyState } from '../../../config/fortnite/events'

import { AccountsManager } from '../../../kernel/startup/accounts'
import { Automation } from '../../../kernel/startup/automation'
import { Authentication } from '../authentication'
import { ClaimRewards } from '../claim-rewards'
import { Party } from '../party'

import { findPlayer } from '../../../services/endpoints/matchmaking'

export class AccountProcess {
  private _accountId: string
  private account: AccountData
  private currentWindow: BrowserWindow

  private _matchmaking: MatchMakingData = {
    partyState: null,
    started: false,
  }
  private _startedTracking = false

  private missionIntervalId: NodeJS.Timeout | null = null
  private missionTimeout: NodeJS.Timeout | null = null

  constructor(config: {
    accessToken: string
    account: AccountData
    currentWindow: BrowserWindow
  }) {
    this._accountId = config.account.accountId
    this.account = config.account
    this.currentWindow = config.currentWindow
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

  initMissionInterval() {
    if (this.missionIntervalId) {
      return
    }

    this.missionIntervalId = setInterval(async () => {
      const currentAccount = AccountsManager.getAccountById(this.accountId)
      const automationAccount = Automation.getAccountById(this.accountId)

      if (!currentAccount || !automationAccount) {
        this.clearMissionIntervalId()

        return
      }

      const accessToken = await Authentication.verifyAccessToken(
        this.account,
        this.currentWindow
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

      if (automationAccount.actions.kick === true) {
        this.clearMissionIntervalId()

        const accounts = AccountsManager.getAccounts()

        await Party.kickPartyMembers(
          this.currentWindow,
          currentAccount,
          [...accounts.values()],
          automationAccount.actions.claim ?? false,
          {
            useGlobalNotification: true,
          }
        )

        return
      }

      if (automationAccount.actions.claim === true) {
        this.clearMissionIntervalId()

        await ClaimRewards.start(
          this.currentWindow,
          [currentAccount],
          true
        )

        return
      }
    }, 3_000) // 3 seconds
  }

  async checkMatchAtStartUp() {
    try {
      const accessToken = await Authentication.verifyAccessToken(
        this.account,
        this.currentWindow
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
