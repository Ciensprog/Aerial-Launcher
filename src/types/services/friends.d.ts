export type FetchFriendResponse = {
  accountId: string
  groups: Array<unknown>
  alias: string
  note: string
  favorite: boolean
  created: string
}

export type FriendsSummaryEntry = {
  accountId: string
  groups?: Array<unknown>
  alias?: string
  note?: string
  favorite?: boolean
  created?: string
}

export type FriendsSummaryResponse = {
  friends: Array<FriendsSummaryEntry>
  incoming: Array<FriendsSummaryEntry>
  outgoing: Array<FriendsSummaryEntry>
}
