import type { ClassValue } from 'clsx'
import type { SelectOption } from '../components/ui/third-party/extended/input-tags'
import type { AccountData, AccountDataRecord } from '../types/accounts'
import type { TagRecord } from '../types/tags'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { useGetTags } from '../hooks/tags'

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
    const _itemADisplayName =
      (itemA.customDisplayName?.trim() ?? '') === ''
        ? itemA.displayName
        : itemA.customDisplayName ?? ''
    const _itemBDisplayName =
      (itemB.customDisplayName?.trim() ?? '') === ''
        ? itemB.displayName
        : itemB.customDisplayName ?? ''

    return _itemADisplayName.localeCompare(_itemBDisplayName, undefined, {
      numeric: true,
    })
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
    itemA.localeCompare(itemB, undefined, {
      numeric: true,
    })
  )

  const tags = _rawTags.reduce((accumulator, [key, value]) => {
    accumulator[key] = value

    return accumulator
  }, {} as TagRecord)

  return tags
}

export function parseCustomDisplayName(account: AccountData | null) {
  const rawCustomDisplayName = account?.customDisplayName?.trim() ?? ''
  const customDisplayNameText =
    rawCustomDisplayName.length > 0 ? ` (${rawCustomDisplayName})` : ''

  return customDisplayNameText
}
