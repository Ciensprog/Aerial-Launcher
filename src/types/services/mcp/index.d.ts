export type MCPResponse = Record<string, unknown>

export type MCPClientQuestLoginResponse = {
  notifications?: Array<unknown>
}

export * from './activate-consumable.d'
export * from './claim-rewards.d'
export * from './purchase-catalog-entry.d'
export * from './query-profile-main.d'
export * from './query-profile-storage.d'
export * from './query-profile.d'
export * from './storage-transfer.d'
