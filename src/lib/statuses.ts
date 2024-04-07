import type { AccountData } from '../types/accounts'

export function getStatusProvider(provider: AccountData['provider']) {
  const statusProvider = {
    null: 'Unknown Provider',
    undefined: 'Loading...',
  }

  return typeof provider === 'string'
    ? provider
    : statusProvider[`${provider}`]
}
