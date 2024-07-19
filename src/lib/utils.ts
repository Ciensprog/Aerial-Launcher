import type { ClassValue } from 'clsx'
import type { SelectOption } from '../components/ui/third-party/extended/input-tags'
import type { AccountData, AccountDataRecord } from '../types/accounts'
import type { TagRecord } from '../types/tags'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { useGetTags } from '../hooks/tags'

import { checkIfCustomDisplayNameIsValid } from './validations/properties'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function tagsArrayToSelectOptions(
  tags: ReturnType<typeof useGetTags>['tagsArray']
) {
  return tags.map(
    ([key, value]): SelectOption => ({
      color: value ?? undefined,
      label: key,
      value: key,
    })
  )
}

export function sortAccounts(data: AccountDataRecord) {
  const result = Object.values(data)
  const accounts = result.toSorted((itemA, itemB) => {
    const _itemADisplayName = parseCustomDisplayName(itemA)
    const _itemBDisplayName = parseCustomDisplayName(itemB)

    return localeCompareForSorting(_itemADisplayName, _itemBDisplayName)
  })

  const accountList = accounts.reduce((accumulator, current) => {
    accumulator[current.accountId] = current

    return accumulator
  }, {} as AccountDataRecord)

  return accountList
}

export function sortTags(data: TagRecord) {
  const result = Object.entries(data)
  const _rawTags = result.toSorted(([itemA], [itemB]) =>
    localeCompareForSorting(itemA, itemB)
  )

  const tags = _rawTags.reduce((accumulator, [key, value]) => {
    accumulator[key] = value

    return accumulator
  }, {} as TagRecord)

  return tags
}

export function parseCustomDisplayName(account?: AccountData | null) {
  if (!account) {
    return 'Unknown User'
  }

  const customDisplayNameText = checkIfCustomDisplayNameIsValid(
    account?.customDisplayName
  )
    ? `${account?.customDisplayName}`
    : `${account?.displayName}`

  return customDisplayNameText
}

/**
 *
 * @param max number. `Default: 100`
 * @returns random number
 */
export function randomNumber(max?: number) {
  return Math.floor(Math.random() * (max ?? 100))
}

export function localeCompareForSorting(valueA: string, valueB: string) {
  return valueA.localeCompare(valueB, undefined, {
    numeric: true,
  })
}
