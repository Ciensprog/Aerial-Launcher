export type AddNewFriendNotification =
  | {
      data: null
      displayName: string
      errorMessage: number | string | null
      success: false
    }
  | {
      data: {
        accountId: string
        displayName: string
      }
      displayName: string
      errorMessage: null
      success: true
    }

export type InviteNotification = {
  accountId: string
  type: 'friend-request' | 'invite'
}

export type PartyPlayerExternalAuth = {
  type: string
  displayName: string
}

export type PartyPlayerFriendshipStatus =
  | 'friends'
  | 'not-friends'
  | 'outgoing'
  | 'incoming'

export type PartyPlayerFriendship = {
  accountId: string
  displayName: string
  status: PartyPlayerFriendshipStatus
  created: string | null
}

export type PartyPlayerMutualFriend = {
  accountId: string
  displayName: string
}

export type PartyPlayerLookupData = {
  lookup: {
    id: string
    displayName: string
    externalAuthType?: 'psn' | 'xbl'
    externalAuths: Array<PartyPlayerExternalAuth>
  }
  friendships: Array<PartyPlayerFriendship>
  lastOnline: string | null
  mutualFriends: Array<PartyPlayerMutualFriend>
  mutualFriendsTotal: number
}

export type PartyPlayerLookupResponse =
  | {
      data: null
      errorMessage: string | null
      success: false
    }
  | {
      data: PartyPlayerLookupData
      errorMessage: null
      success: true
    }

export type PartyIncomingFriendRequest = {
  accountDisplayName: string
  accountId: string
  created: string | null
  friendDisplayName: string
  friendId: string
}

export type PartyStatusMember = {
  accountId: string
  displayName: string
  role: 'CAPTAIN' | 'MEMBER'
  isYou: boolean
}

export type PartyStatusAccountData = {
  accountId: string
  available: boolean
  errorMessage?: string
  inParty: boolean
  isLeader: boolean
  partyId: string | null
  memberCount: number
  maxSize: number
  members: Array<PartyStatusMember>
}

export type PartyStatusAction = 'kick' | 'promote' | 'leave'

export type PartyStatusActionResponse = {
  accountId: string
  success: boolean
  errorMessage?: string
  data?: PartyStatusAccountData
  action?: PartyStatusAction
  memberName?: string
}
