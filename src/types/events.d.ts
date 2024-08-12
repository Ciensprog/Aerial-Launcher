import { EventNotification, PartyState } from '../config/fortnite/events'

import { StringUnion } from './utils.d'

export type ServiceEventMemberConnected = {
  type: EventNotification.MEMBER_CONNECTED
  sent: string
  connection: {
    id: string
    meta: Partial<Record<string, string>>
    connected_at: string
    updated_at: string
    yield_leadership: boolean
  }
  revision: number
  ns: StringUnion<'Fortnite'>
  party_id: string
  account_id: string
  account_dn: string
  member_state_updated: Partial<Record<string, string>>
  joined_at: string
  updated_at: string
}

export type ServiceEventMemberDisconnected = {
  type: EventNotification.MEMBER_DISCONNECTED
  sent: string
  connection: {
    id: string
    meta: Partial<Record<string, string>>
    connected_at: string
    disconnected_at: string
    updated_at: string
    yield_leadership: boolean
  }
  revision: number
  expires: string
  ns: StringUnion<'Fortnite'>
  party_id: string
  account_id: string
  account_dn: string
  member_state_updated: Partial<Record<string, string>>
  joined_at: string
  updated_at: string
}

export type ServiceEventMemberExpired = {
  type: EventNotification.MEMBER_EXPIRED
  sent: string
  revision: number
  ns: StringUnion<'Fortnite'>
  party_id: string
  account_id: string
  member_state_updated: Partial<Record<string, string>>
}

export type ServiceEventMemberJoined = {
  type: EventNotification.MEMBER_JOINED
  sent: string
  connection: {
    id: string
    meta: Partial<Record<string, string>>
    connected_at: string
    updated_at: string
    yield_leadership: boolean
  }
  revision: number
  ns: StringUnion<'Fortnite'>
  party_id: string
  account_id: string
  account_dn: string
  member_state_updated: Partial<Record<string, string>>
  joined_at: string
  updated_at: string
}

export type ServiceEventMemberLeft = {
  type: EventNotification.MEMBER_LEFT
  sent: string
  revision: number
  ns: StringUnion<'Fortnite'>
  party_id: string
  account_id: string
  member_state_updated: Partial<Record<string, string>>
}

export type ServiceEventMemberStateUpdated = {
  type: EventNotification.MEMBER_STATE_UPDATED
  sent: string
  revision: 2
  ns: StringUnion<'Fortnite'>
  party_id: string
  account_id: string
  account_dn: string
  member_state_removed: Array<unknown>
  member_state_updated: Partial<Record<string, string>>
  member_state_overridden: Partial<Record<string, string>>
  joined_at: string
  updated_at: string
}

export type ServiceEventPartyUpdated = {
  type: EventNotification.PARTY_UPDATED
  sent: string
  ns: StringUnion<'Fortnite'>
  party_id: string
  captain_id: string
  party_state_removed: Array<unknown>
  party_state_updated: Partial<Record<string, string>>
  party_state_overridden: Partial<Record<string, string>>
  party_privacy_type: StringUnion<'INVITE_AND_FORMER'>
  party_type: StringUnion<'DEFAULT'>
  party_sub_type: StringUnion<'default'>
  max_number_of_members: number
  invite_ttl_seconds: number
  intention_ttl_seconds: number
  created_at: string
  updated_at: string
  revision: number
}

export type ServiceEventInteractionNotification = {
  type: EventNotification.INTERACTION_NOTIFICATION
  interactions: Array<InteractionNotification>
}

export type InteractionNotification = {
  _type: StringUnion<'InteractionUpdateNotification'>
  fromAccountId: string
  toAccountId: string
  app: StringUnion<'Save_The_World'>
  interactionType: StringUnion<
    'GamePlayed' | 'PartyInviteSent' | 'PartyJoined' | 'PingSent'
  >
  namespace: StringUnion<'Fortnite'>
  happenedAt: number
  interactionScoreIncremental: {
    total: number
    count: number
  }
  resultsIncremental: {
    timePlayed: number
    playlist: number
    gameType_StW: number
    timePlayedActive: number
    startAt: number
  }
  resultsAction: StringUnion<'ADD'>
  interactionId: string
  isFriend: boolean
}

export type MatchMakingData = {
  partyState: PartyState | null
  started: boolean
}
