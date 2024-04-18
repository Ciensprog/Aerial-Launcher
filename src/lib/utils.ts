import type { ClassValue } from 'clsx'
import type { AccountDataRecord } from '../types/accounts'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sortAccounts(data: AccountDataRecord) {
  const result = Object.values(data)
  const accounts = result.toSorted((itemA, itemB) =>
    itemA.displayName.localeCompare(itemB.displayName)
  )

  const accountList = accounts.reduce((accumulator, current) => {
    accumulator[current.accountId] = current

    return accumulator
  }, {} as AccountDataRecord)

  return accountList
}
