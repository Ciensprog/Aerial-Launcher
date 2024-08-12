import type { AccountData } from '../../types/accounts'
import type {
  MatchMakingData,
  ServiceEventInteractionNotification,
  ServiceEventMemberConnected,
  ServiceEventMemberDisconnected,
  ServiceEventMemberExpired,
  ServiceEventMemberJoined,
  ServiceEventMemberLeft,
  ServiceEventMemberStateUpdated,
  ServiceEventPartyUpdated,
} from '../../types/events'

import NodeCrypto from 'node:crypto'
import EventEmitter from 'node:events'
import { BrowserWindow } from 'electron'
import * as XMPP from 'stanza'

import {
  EventNotification,
  PartyState,
  ServiceEvent,
} from '../../config/fortnite/events'

import { AccountsManager } from '../startup/accounts'
import { Automation } from '../startup/automation'
import { Authentication } from './authentication'
import { ClaimRewards } from './claim-rewards'
import { Party } from './party'

import { findPlayer } from '../../services/endpoints/matchmaking'

export class Service {
  private _accountId: string
  private account: AccountData
  private currentWindow: BrowserWindow

  private _activeEvents: Array<string> = []
  private _event: EventEmitter

  private connection: XMPP.Agent | null = null

  private _startedTracking = false
  private matchmaking: MatchMakingData = {
    partyState: null,
    started: false,
  }

  private missionInterval: NodeJS.Timeout | null = null
  private missionTimeout: NodeJS.Timeout | null = null

  constructor(config: {
    currentWindow: BrowserWindow
    account: AccountData
  }) {
    this._accountId = config.account.accountId
    this.account = config.account
    this.currentWindow = config.currentWindow
    this._event = new EventEmitter()
  }

  get accountId() {
    return this._accountId
  }

  get startedTracking() {
    return this._startedTracking
  }

  setStartedTracking(value: boolean) {
    this._startedTracking = value
  }

  async init(config?: Partial<{ force: boolean }>) {
    return new Promise<boolean | null>((resolve) => {
      if (
        !config?.force &&
        (this.connection || !this.account || !this.currentWindow)
      ) {
        return resolve(null)
      }

      Authentication.verifyAccessToken(this.account, this.currentWindow)
        .then((accessToken) => {
          try {
            if (!accessToken) {
              return resolve(false)
            }

            const resourceHash = NodeCrypto.randomBytes(16)
              .toString('hex')
              .toUpperCase()

            this.connection = XMPP.createClient({
              jid: `${this.account.accountId}@prod.ol.epicgames.com`,
              server: 'prod.ol.epicgames.com',
              transports: {
                websocket: `wss://xmpp-service-prod.ol.epicgames.com`,
                bosh: false,
              },
              credentials: {
                host: 'prod.ol.epicgames.com',
                username: this.account.accountId,
                password: accessToken,
              },
              resource: `V2:Fortnite:WIN::${resourceHash}`,
            })

            this.connection.enableKeepAlive({
              interval: 30,
            })

            const initTimeout = setTimeout(() => {
              resolve(false)
            }, 10_000) // 10 seconds

            this.connection.once('session:started', async () => {
              this.emit(ServiceEvent.SESSION_STARTED)
            })

            this.connection.on('disconnected', () => {
              this.emit(ServiceEvent.DISCONNECTED)
              this.destroy()
            })

            this.connection.on('connected', () => {
              this.emit(ServiceEvent.CONNECTED)

              clearTimeout(initTimeout)
              resolve(true)
            })

            this.connection.on('message', async (message) => {
              if (
                (message.type && message.type !== 'normal') ||
                !message.body ||
                message.from !== 'xmpp-admin@prod.ol.epicgames.com'
              ) {
                return
              }

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              let body: any = {}

              try {
                body = JSON.parse(message.body)
              } catch (error) {
                //
              }

              if (Object.keys(body).length <= 0) {
                return
              }

              try {
                // Password has been changed (session expired), client close/disconnect from FN, etc... then:
                // com.epicgames.social.party.notification.v0.MEMBER_DISCONNECTED
                // com.epicgames.social.party.notification.v0.MEMBER_EXPIRED

                // com.epicgames.social.party.notification.v0.PARTY_UPDATED
                //    -> party_state_updated.Default:PartyState_s = Matchmaking
                //    -> party_state_updated.Default:PartyState_s = PostMatchmaking

                // com.epicgames.social.party.notification.v0.MEMBER_LEFT
                // com.epicgames.social.party.notification.v0.MEMBER_JOINED

                switch (body?.type) {
                  case EventNotification.MEMBER_CONNECTED:
                    this.emit<ServiceEventMemberConnected>(
                      EventNotification.MEMBER_CONNECTED,
                      body
                    )
                    break
                  case EventNotification.MEMBER_DISCONNECTED:
                    this.emit<ServiceEventMemberDisconnected>(
                      EventNotification.MEMBER_DISCONNECTED,
                      body
                    )
                    break
                  case EventNotification.MEMBER_EXPIRED:
                    this.emit<ServiceEventMemberExpired>(
                      EventNotification.MEMBER_EXPIRED,
                      body
                    )
                    break
                  case EventNotification.MEMBER_JOINED:
                    this.emit<ServiceEventMemberJoined>(
                      EventNotification.MEMBER_JOINED,
                      body
                    )
                    break
                  case EventNotification.MEMBER_LEFT:
                    this.emit<ServiceEventMemberLeft>(
                      EventNotification.MEMBER_LEFT,
                      body
                    )
                    break
                  case EventNotification.MEMBER_STATE_UPDATED:
                    this.emit<ServiceEventMemberStateUpdated>(
                      EventNotification.MEMBER_STATE_UPDATED,
                      body
                    )
                    break
                  case EventNotification.PARTY_UPDATED:
                    {
                      const newBody = body as ServiceEventPartyUpdated
                      const partyState =
                        newBody.party_state_updated['Default:PartyState_s']

                      if (partyState) {
                        this.matchmaking.partyState =
                          partyState as PartyState

                        if (
                          this.matchmaking.partyState !==
                          PartyState.POST_MATCHMAKING
                        ) {
                          this.clearMissionInterval()
                        } else {
                          if (this.missionTimeout) {
                            clearTimeout(this.missionTimeout)
                          }

                          this.missionTimeout = setTimeout(() => {
                            // this.clearMissionInterval()
                            this.initMissionInterval()
                          }, 10_000) // 10 seconds
                        }
                      }

                      this.emit(EventNotification.PARTY_UPDATED, newBody)
                    }
                    break
                  case EventNotification.INTERACTION_NOTIFICATION:
                    {
                      const newBody =
                        body as ServiceEventInteractionNotification

                      if (newBody.interactions?.length > 0) {
                        const gamePlayed = newBody.interactions.some(
                          (interaction) =>
                            interaction.namespace?.toLowerCase() ===
                              'fortnite' &&
                            interaction.app?.toLowerCase() ===
                              'save_the_world' &&
                            interaction.interactionType?.toLowerCase() ===
                              'gameplayed'
                        )

                        if (gamePlayed) {
                          const accounts = AccountsManager.getAccounts()
                          const currentAccount = accounts.get(
                            this.account.accountId
                          )

                          if (!currentAccount) {
                            this.clearMissionInterval()

                            return
                          }

                          const currentAutomationAccount =
                            Automation.getAccountById(
                              currentAccount.accountId
                            )

                          if (
                            currentAutomationAccount?.actions.kick === true
                          ) {
                            this.clearMissionInterval()

                            await Party.kickPartyMembers(
                              this.currentWindow,
                              currentAccount,
                              [...accounts.values()],
                              currentAutomationAccount?.actions.claim ??
                                false,
                              {
                                useGlobalNotification: true,
                              }
                            )
                          } else if (
                            currentAutomationAccount?.actions.claim ===
                            true
                          ) {
                            this.clearMissionInterval()

                            await ClaimRewards.start(
                              this.currentWindow,
                              [currentAccount],
                              true
                            )
                          }

                          this.emit(
                            EventNotification.INTERACTION_NOTIFICATION,
                            newBody
                          )
                        } else {
                          this.clearMissionInterval()
                        }
                      }
                    }
                    break
                }
              } catch (error) {
                //
              }
            })

            this.connection.connect()
          } catch (error) {
            resolve(false)
          }
        })
        .catch(() => {
          resolve(false)
        })
    })
  }

  async checkMatchAtStartUp() {
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

    if (response.data.length > 0) {
      const data = response.data?.[0]

      if (data && data.started !== undefined) {
        this.matchmaking.partyState = data.started
          ? PartyState.POST_MATCHMAKING
          : PartyState.MATCHMAKING
        this.matchmaking.started = data.started

        this.initMissionInterval()
      }
    }
  }

  destroy() {
    this.emit(ServiceEvent.DESTROY)

    this.clearMissionInterval()

    this._startedTracking = false

    this.connection?.disconnect()
    this.connection?.removeAllListeners()
    this.connection = null

    this._activeEvents = []
    this._event.removeAllListeners()
  }

  emit<Value>(eventName: EventNotification | ServiceEvent, value?: Value) {
    if (!this._activeEvents.includes(eventName)) {
      return
    }

    this._event.emit(eventName, value)
  }

  initMissionInterval() {
    if (this.missionInterval) {
      return
    }

    const clear = () => {
      if (this.missionInterval) {
        clearInterval(this.missionInterval)
      }
    }

    this.missionInterval = setInterval(async () => {
      const accounts = AccountsManager.getAccounts()
      const currentAccount = accounts.get(this.account.accountId)
      const currentAutomationAccount = Automation.getAccountById(
        this.account.accountId
      )

      if (
        !currentAccount ||
        !currentAutomationAccount ||
        (!currentAutomationAccount?.actions.kick &&
          !currentAutomationAccount?.actions.claim)
      ) {
        clear()

        return
      }

      const accessToken = await Authentication.verifyAccessToken(
        this.account,
        this.currentWindow
      )

      if (!accessToken) {
        clear()

        return
      }

      const response = await findPlayer({
        accessToken,
        accountId: this.account.accountId,
      })

      if (response.data.length > 0) {
        const data = response.data?.[0]

        if (data) {
          if (
            data.publicPlayers.includes(this.account.accountId) &&
            data.publicPlayers.length > 1
          ) {
            this.clearMissionInterval()
          } else if (data.started !== undefined) {
            if (
              this.matchmaking.partyState ===
                PartyState.POST_MATCHMAKING &&
              this.matchmaking.started &&
              !data.started
            ) {
              const currentAutomationAccount = Automation.getAccountById(
                currentAccount.accountId
              )

              if (currentAutomationAccount?.actions.kick === true) {
                this.clearMissionInterval()

                await Party.kickPartyMembers(
                  this.currentWindow,
                  currentAccount,
                  [...accounts.values()],
                  currentAutomationAccount?.actions.claim ?? false,
                  {
                    useGlobalNotification: true,
                  }
                )
              } else if (
                currentAutomationAccount?.actions.claim === true
              ) {
                this.clearMissionInterval()

                await new Promise((resolve) => {
                  setTimeout(async () => {
                    await ClaimRewards.start(
                      this.currentWindow,
                      [currentAccount],
                      true
                    )

                    resolve(true)
                  }, 500) // 0.5 seconds extra
                })
              }
            } else {
              this.matchmaking.started = data.started
            }
          }
        }
      } else {
        this.clearMissionInterval()
      }
    }, 2_000) // 2 seconds
  }

  clearMissionInterval() {
    this.matchmaking.partyState = null
    this.matchmaking.started = false

    if (this.missionInterval) {
      clearInterval(this.missionInterval)
    }

    if (this.missionTimeout) {
      clearTimeout(this.missionTimeout)
    }

    this.missionInterval = null
    this.missionTimeout = null
  }

  /**
   * Base Events
   */

  onConnected(callback: () => void) {
    this.checkOrRegisterEvent(ServiceEvent.CONNECTED, callback)
  }

  onDisconnected(callback: () => void) {
    this.checkOrRegisterEvent(ServiceEvent.DISCONNECTED, callback)
  }

  onDestroy(callback: () => void) {
    this.checkOrRegisterEvent(ServiceEvent.DESTROY, callback)
  }

  onceSessionStarted(callback: () => void) {
    this.checkOrRegisterEvent(ServiceEvent.SESSION_STARTED, callback)
  }

  /**
   * Available Events
   */

  onMemberConnected(
    callback: (value: ServiceEventMemberConnected) => void
  ) {
    this.checkOrRegisterEvent(EventNotification.MEMBER_CONNECTED, callback)
  }

  onMemberDisconnected(
    callback: (value: ServiceEventMemberDisconnected) => void
  ) {
    this.checkOrRegisterEvent(
      EventNotification.MEMBER_DISCONNECTED,
      callback
    )
  }

  onMemberExpired(callback: (value: ServiceEventMemberExpired) => void) {
    this.checkOrRegisterEvent(EventNotification.MEMBER_EXPIRED, callback)
  }

  onMemberJoined(callback: (value: ServiceEventMemberJoined) => void) {
    this.checkOrRegisterEvent(EventNotification.MEMBER_JOINED, callback)
  }

  onMemberLeft(callback: (value: ServiceEventMemberLeft) => void) {
    this.checkOrRegisterEvent(EventNotification.MEMBER_LEFT, callback)
  }

  onMemberStateUpdated(
    callback: (value: ServiceEventMemberStateUpdated) => void
  ) {
    this.checkOrRegisterEvent(
      EventNotification.MEMBER_STATE_UPDATED,
      callback
    )
  }

  onPartyUpdated(callback: (value: ServiceEventPartyUpdated) => void) {
    this.checkOrRegisterEvent(EventNotification.PARTY_UPDATED, callback)
  }

  /**
   * Private
   */

  private checkOrRegisterEvent<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CallbackFunction extends (...args: Array<any>) => void,
  >(
    eventName: EventNotification | ServiceEvent,
    callback: CallbackFunction
  ) {
    if (this._activeEvents.includes(eventName)) {
      return
    }

    this._activeEvents.push(eventName)
    this._event.on(
      eventName,
      typeof callback === 'function' ? callback : () => {}
    )
  }
}
