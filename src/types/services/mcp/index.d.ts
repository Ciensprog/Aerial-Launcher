export type MCPResponse = Record<string, unknown>

export type MCPClientQuestLoginResponse = {
  notifications?: Array<unknown>
}

export * from './activate-consumable.d'
export * from './claim-rewards.d'
export * from './query-profile-main.d'
export * from './query-profile.d'
