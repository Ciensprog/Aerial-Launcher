import type {
  SelectCustomFilter,
  SelectOption,
} from '../../../components/ui/third-party/extended/input-tags'

import { defaultColor } from '../../../config/constants/colors'
import { BulkTags, getBulkTags } from '../../../config/constants/tags'

import { useGetAccounts } from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'
import { useGetTags } from '../../../hooks/tags'

import { checkIfCustomDisplayNameIsValid } from '../../../lib/validations/properties'
import {
  localeCompareForSorting,
  parseCustomDisplayName,
} from '../../../lib/utils'

export function useAccountSelectorData({
  selectedAccounts,
  selectedTags,
}: {
  selectedAccounts: Array<string>
  selectedTags: Array<string>
}) {
  const { accountList, accountsArray } = useGetAccounts()
  const { groupsArray } = useGetGroups()
  const { tagsArray } = useGetTags()

  const areThereAccounts = accountsArray.length > 0
  const accounts: Array<SelectOption> = accountsArray.map((account) => {
    const label = parseCustomDisplayName(account)

    return {
      label,
      color: defaultColor,
      value: account.accountId,
    }
  })
  const tags: Array<SelectOption> = tagsArray.map(([name, color]) => ({
    color: color ?? defaultColor,
    label: name,
    value: name,
  }))

  const parsedSelectedAccounts: Array<SelectOption> = selectedAccounts.map(
    (accountId) => {
      const selected = accounts.find((item) => item.value === accountId)!

      return {
        color: defaultColor,
        label: selected.label,
        value: selected.value,
      }
    }
  )
  const parsedSelectedTags: Array<SelectOption> = selectedTags.map(
    (tagName) => {
      const selected = tags.find((item) => item.value === tagName)!

      return {
        color: selected.color,
        label: selected.label,
        value: selected.value,
      }
    }
  )

  const isSelectedEmpty =
    parsedSelectedAccounts.length === 0 && parsedSelectedTags.length === 0

  const getAccounts = () => {
    const currentTags = parsedSelectedTags.map(({ value }) => value)
    const bulkTags = getBulkTags()
    const hasBulkTag = currentTags.some((tag) =>
      bulkTags.includes(tag.trim().toLowerCase() as BulkTags)
    )

    if (hasBulkTag) {
      return accountsArray
    }

    const accountIds = [
      ...new Set([
        ...parsedSelectedAccounts.map(({ value }) => value),
        ...groupsArray
          .filter(([, itemTags]) =>
            currentTags.some((currentTag) => itemTags.includes(currentTag))
          )
          .map(([key]) => key),
      ]),
    ]

    return accountIds
      .map((accountId) => accountList[accountId])
      .filter((account) => account !== undefined)
      .toSorted((itemA, itemB) =>
        localeCompareForSorting(
          parseCustomDisplayName(itemA),
          parseCustomDisplayName(itemB)
        )
      )
  }

  return {
    accounts,
    areThereAccounts,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,

    getAccounts,
  }
}

export function useAccountsInputTagsCustomFilter() {
  const { accountList } = useGetAccounts()
  const { getGroupTagsByAccountId } = useGetGroups()

  const filter: SelectCustomFilter = (option, input) => {
    const currentItem = accountList[option.value]

    if (currentItem) {
      const _search = input.toLowerCase().trim()
      const keywords: Array<string> = [currentItem.displayName]
      const tags = getGroupTagsByAccountId(currentItem.accountId)

      if (checkIfCustomDisplayNameIsValid(currentItem.customDisplayName)) {
        keywords.push(currentItem.customDisplayName)
      }

      if (tags.length > 0) {
        tags.forEach((tagName) => {
          keywords.push(tagName)
        })
      }

      return keywords.some((keyword) =>
        keyword.toLowerCase().trim().includes(_search)
      )
    }

    return false
  }

  return {
    filter,
  }
}
