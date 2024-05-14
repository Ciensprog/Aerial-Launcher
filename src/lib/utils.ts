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
    const _itemADisplayName = checkIfCustomDisplayNameIsValid(
      itemA.customDisplayName
    )
      ? itemA.customDisplayName ?? ''
      : itemA.displayName
    const _itemBDisplayName = checkIfCustomDisplayNameIsValid(
      itemB.customDisplayName
    )
      ? itemB.customDisplayName ?? ''
      : itemB.displayName

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

export function parseDisplayName(account: AccountData) {
  return checkIfCustomDisplayNameIsValid(account.customDisplayName)
    ? account.customDisplayName
    : account.displayName
}

export function parseCustomDisplayName(account: AccountData | null) {
  const customDisplayNameText = checkIfCustomDisplayNameIsValid(
    account?.customDisplayName
  )
    ? ` (${account?.customDisplayName})`
    : ''

  return customDisplayNameText
}
