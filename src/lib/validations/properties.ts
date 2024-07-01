import type { AccountData } from '../../types/accounts'

export function checkIfCustomDisplayNameIsValid(
  customDisplayName: AccountData['customDisplayName']
): customDisplayName is string {
  return (
    Boolean(customDisplayName) &&
    typeof customDisplayName === 'string' &&
    customDisplayName.trim() !== ''
  )
}
