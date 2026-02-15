import type { AccountData } from '../../../types/accounts'
import type {
  ServiceEventInteractionNotification,
  ServiceEventMemberConnected,
  ServiceEventMemberDisconnected,
  ServiceEventMemberExpired,
  ServiceEventMemberJoined,
  ServiceEventMemberKicked,
  ServiceEventMemberLeft,
  ServiceEventMemberStateUpdated,
  ServiceEventPartyInvite,
  ServiceEventPartyUpdated,
} from '../../../types/events'

import NodeCrypto from 'node:crypto'
import { EventEmitter } from 'node:events'
import * as XMPP from 'stanza'

import {
  EventNotification,
  ServiceEvent,
} from '../../../config/fortnite/events'

export class AccountService {
  private _accountId: string
  private account: AccountData

  private _activeEvents: Array<string> = []
  private _event: EventEmitter

  private connection: XMPP.Agent

  constructor(config: { accessToken: string; account: AccountData }) {
    this._accountId = config.account.accountId
    this.account = config.account
    this._event = new EventEmitter()

    const resourceHash = NodeCrypto.randomBytes(16)
      .toString('hex')
      .toUpperCase()
    const serverUrl = 'prod.ol.epicgames.com'

    this.connection = XMPP.createClient({
      jid: `${this.account.accountId}@${serverUrl}`,
      server: serverUrl,
      transports: {
        websocket: `wss://xmpp-service-${serverUrl}`,
        bosh: false,
      },
      credentials: {
        host: serverUrl,
        username: this.account.accountId,
        password: config.accessToken,
      },
      resource: `V2:Fortnite:WIN::${resourceHash}`,
    })

    this.connection.enableKeepAlive({
      interval: 30,
    })

    this.initEvents()

    this.connection.connect()
  }

  get accountId() {
    return this._accountId
  }

  get JID() {
    return this.connection.jid
  }

  sendPresence(status: string, joininfodata: Record<string, unknown>) {
    return this.connection.sendPresence({
      status: JSON.stringify({
        Status: status || 'Playing Battle Royale',
        bIsPlaying: false,
        bIsJoinable: true,
        bHasVoiceSupport: false,
        SessionId: '',
        ProductName: 'Fortnite',
        Properties: {
          'party.joininfodata.286331153_j': joininfodata,
          FortBasicInfo_j: {
            homeBaseRating: 0,
          },
          FortLFG_I: '0',
          FortPartySize_i: 1,
          FortSubGame_i: 1,
          InUnjoinableMatch_b: false,
          FortGameplayStats_j: {
            state: '',
            playlist: 'None',
            numKills: 0,
            bFellToDeath: false,
          },
        },
      }),
      to: undefined,
      show: 'away',
    })
  }

  destroy() {
    this.emit(ServiceEvent.DESTROY)

    this.connection.disconnect()
    this.connection.removeAllListeners()

    this._activeEvents = []
    this._event.removeAllListeners()
  }

  emit<Value>(eventName: EventNotification | ServiceEvent, value?: Value) {
    if (!this._activeEvents.includes(eventName)) {
      return
    }

    this._event.emit(eventName, value)
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
    callback: (value: ServiceEventMemberConnected) => void,
  ) {
    this.checkOrRegisterEvent(EventNotification.MEMBER_CONNECTED, callback)
  }

  onMemberDisconnected(
    callback: (value: ServiceEventMemberDisconnected) => void,
  ) {
    this.checkOrRegisterEvent(
      EventNotification.MEMBER_DISCONNECTED,
      callback,
    )
  }

  onMemberExpired(callback: (value: ServiceEventMemberExpired) => void) {
    this.checkOrRegisterEvent(EventNotification.MEMBER_EXPIRED, callback)
  }

  onMemberJoined(callback: (value: ServiceEventMemberJoined) => void) {
    this.checkOrRegisterEvent(EventNotification.MEMBER_JOINED, callback)
  }

  onMemberKicked(callback: (value: ServiceEventMemberKicked) => void) {
    this.checkOrRegisterEvent(EventNotification.MEMBER_KICKED, callback)
  }

  onMemberLeft(callback: (value: ServiceEventMemberLeft) => void) {
    this.checkOrRegisterEvent(EventNotification.MEMBER_LEFT, callback)
  }

  onMemberStateUpdated(
    callback: (value: ServiceEventMemberStateUpdated) => void,
  ) {
    this.checkOrRegisterEvent(
      EventNotification.MEMBER_STATE_UPDATED,
      callback,
    )
  }

  onPartyUpdated(callback: (value: ServiceEventPartyUpdated) => void) {
    this.checkOrRegisterEvent(EventNotification.PARTY_UPDATED, callback)
  }

  onPartyInvite(callback: (value: ServiceEventPartyInvite) => void) {
    this.checkOrRegisterEvent(EventNotification.PING, callback)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onGenericMessage(callback: (value: any) => void) {
    this.checkOrRegisterEvent(EventNotification.GENERIC_MESSAGE, callback)
  }

  /**
   * Private
   */

  private checkOrRegisterEvent<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CallbackFunction extends (...args: Array<any>) => void,
  >(
    eventName: EventNotification | ServiceEvent,
    callback: CallbackFunction,
  ) {
    if (this._activeEvents.includes(eventName)) {
      return
    }

    this._activeEvents.push(eventName)
    this._event.on(
      eventName,
      typeof callback === 'function' ? callback : () => {},
    )
  }

  private initEvents() {
    this.connection.once('session:started', () => {
      this.emit(ServiceEvent.SESSION_STARTED)
    })

    this.connection.on('disconnected', () => {
      this.emit(ServiceEvent.DISCONNECTED)
    })

    this.connection.on('connected', () => {
      this.emit(ServiceEvent.CONNECTED)
    })

    this.connection.on('message', (message) => {
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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        //
      }

      if (Object.keys(body).length <= 0) {
        return
      }

      try {
        switch (body?.type) {
          case EventNotification.MEMBER_CONNECTED:
            this.emit<ServiceEventMemberConnected>(
              EventNotification.MEMBER_CONNECTED,
              body,
            )
            break
          case EventNotification.MEMBER_DISCONNECTED:
            this.emit<ServiceEventMemberDisconnected>(
              EventNotification.MEMBER_DISCONNECTED,
              body,
            )
            break
          case EventNotification.MEMBER_EXPIRED:
            this.emit<ServiceEventMemberExpired>(
              EventNotification.MEMBER_EXPIRED,
              body,
            )
            break
          case EventNotification.MEMBER_JOINED:
            this.emit<ServiceEventMemberJoined>(
              EventNotification.MEMBER_JOINED,
              body,
            )
            break
          case EventNotification.MEMBER_KICKED:
            this.emit<ServiceEventMemberKicked>(
              EventNotification.MEMBER_KICKED,
              body,
            )
            break
          case EventNotification.MEMBER_LEFT:
            this.emit<ServiceEventMemberLeft>(
              EventNotification.MEMBER_LEFT,
              body,
            )
            break
          case EventNotification.MEMBER_STATE_UPDATED:
            this.emit<ServiceEventMemberStateUpdated>(
              EventNotification.MEMBER_STATE_UPDATED,
              body,
            )
            break
          case EventNotification.PARTY_UPDATED:
            this.emit<ServiceEventPartyUpdated>(
              EventNotification.PARTY_UPDATED,
              body,
            )
            break
          case EventNotification.PING:
            this.emit<ServiceEventPartyInvite>(
              EventNotification.PING,
              body,
            )
            break
          case EventNotification.INTERACTION_NOTIFICATION:
            this.emit<ServiceEventInteractionNotification>(
              EventNotification.INTERACTION_NOTIFICATION,
              body,
            )
            break
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        //
      }

      this.emit(EventNotification.GENERIC_MESSAGE, body)
    })
  }
}
