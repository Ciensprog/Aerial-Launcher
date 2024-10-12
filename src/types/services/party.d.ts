export type PartyData = {
  id: string
  created_at: string
  updated_at: string
  config: {
    type: 'DEFAULT'
    joinability: 'INVITE_AND_FORMER' | 'OPEN'
    discoverability: 'ALL' | 'INVITED_ONLY'
    sub_type: 'default'
    max_size: number
    invite_ttl: number
    join_confirmation: boolean
    intention_ttl: number
  }
  members: Array<{
    account_id: string
    meta: Record<string, unknown>
    connections: Array<unknown>
    revision: number
    updated_at: string
    joined_at: string
    role: PartyRole
  }>
  applicants: Array<unknown>
  meta: Record<string, string>
  invites: Array<unknown>
  revision: number
  intentions: Array<unknown>
}

export type FetchPartyResponse = {
  current: Array<PartyData>
  invites: Array<unknown>
  pending: Array<unknown>
  pings: Array<unknown>
}

export type PartyKickResponse = Record<string, unknown>

export type PartyInviteResponse = Record<string, unknown>
