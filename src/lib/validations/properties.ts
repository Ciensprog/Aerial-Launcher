import type { AccountData } from '../../types/accounts'

export function checkIfCustomDisplayNameIsValid(
  customDisplayName: AccountData['customDisplayName']
) {
  return customDisplayName && customDisplayName.trim() !== ''
}
