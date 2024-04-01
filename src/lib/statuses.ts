import type { AccountInformationDetailed } from '../types/accounts'

export function getStatusProvider(
  provider: AccountInformationDetailed['provider']
) {
  const statusProvider = {
    null: 'Unknown Provider',
    undefined: 'Loading...',
  }

  return typeof provider === 'string'
    ? provider
    : statusProvider[`${provider}`]
}
