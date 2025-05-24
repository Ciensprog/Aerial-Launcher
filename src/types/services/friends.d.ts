import type { StringUnion } from '../utils'

export type EpicAddFriend = {
  accountId: string
  displayName?: string
}

export type EpicFriend = {
  accountId: string
  displayName?: string
  groups: Array<unknown>
  alias: string
  mutual: number
  note: string
  favorite: boolean
  created: string
}

export type FriendIncoming = {
  accountId: string
  displayName?: string
  mutual: number
  favorite: boolean
  created: string
}

export type FriendOutgoing = {
  accountId: string
  displayName?: string
  mutual: number
  favorite: boolean
  created: string
}

export type FriendBlock = {
  accountId: string
  displayName?: string
  created: string
}

export type FriendSuggested = Record<string, unknown>

export type AccountSettings = {
  acceptInvites: StringUnion<'public'>
  mutualPrivacy: StringUnion<'ALL', 'NONE'>
}

export type AccountLimitsReached = {
  incoming: boolean
  outgoing: boolean
  accepted: boolean
}

export type FriendsSummary = {
  friends: Array<EpicFriend>
  incoming: Array<FriendIncoming>
  outgoing: Array<FriendOutgoing>
  blocklist: Array<FriendBlock>
  suggested: Array<FriendSuggested>
  settings: AccountSettings | null
  limitsReached: AccountLimitsReached | null
}
