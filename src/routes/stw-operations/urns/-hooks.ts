import type {
  ComboboxOption,
  ComboboxProps,
} from '../../../components/ui/extended/combobox/hooks'

import {
  useGetAutoPinUrnActions,
  useGetAutoPinUrnData,
} from '../../../hooks/stw-operations/urns'
import { useGetAccounts } from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'

import { checkIfCustomDisplayNameIsValid } from '../../../lib/validations/properties'
import {
  localeCompareForSorting,
  parseCustomDisplayName,
} from '../../../lib/utils'
import { useEffect } from 'react'

export function useData() {
  const { accountsArray, accountList } = useGetAccounts()
  const { getGroupTagsByAccountId } = useGetGroups()
  const { selectedAccounts } = useGetAutoPinUrnData()
  const { addAccount, removeAccount, updateAccount } =
    useGetAutoPinUrnActions()

  const options = accountsArray
    .filter((account) => selectedAccounts[account.accountId] === undefined)
    .map((account) => {
      const _keys: Array<string> = [account.displayName]
      const tags = getGroupTagsByAccountId(account.accountId)

      if (checkIfCustomDisplayNameIsValid(account.customDisplayName)) {
        _keys.push(account.customDisplayName)
      }

      if (tags.length > 0) {
        tags.forEach((tagName) => {
          _keys.push(tagName)
        })
      }

      return {
        keywords: _keys,
        label: parseCustomDisplayName(account),
        value: account.accountId,
      } as ComboboxOption
    })
  const accounts = Object.keys(selectedAccounts)
    .filter((accountId) => accountList[accountId])
    .map((accountId) => accountList[accountId])
    .toSorted((itemA, itemB) =>
      localeCompareForSorting(
        parseCustomDisplayName(itemA),
        parseCustomDisplayName(itemB)
      )
    )
  const accountSelectorIsDisabled = options.length <= 0

  useEffect(() => {
    const listener = window.electronAPI.notificationAutoPinUrnsData(
      async (value) => {
        Object.entries(value).forEach(([accountId, value]) => {
          addAccount(accountId, value)
        })
      }
    )

    window.electronAPI.autoPinUrnsRequestData()

    return () => {
      listener.removeListener()
    }
  }, [])

  const customFilter: ComboboxProps['customFilter'] = (
    _value,
    search,
    keywords
  ) => {
    const _search = search.toLowerCase().trim()
    const _keys =
      keywords &&
      keywords.some((keyword) =>
        keyword.toLowerCase().trim().includes(_search)
      )

    return _keys ? 1 : 0
  }

  const onSelectItem = (accountId: string) => {
    addAccount(accountId)
    window.electronAPI.autoPinUrnsAdd(accountId)
  }

  const handleRemoveAccount = (accountId: string) => () => {
    removeAccount(accountId)
    window.electronAPI.autoPinUrnsRemove(accountId)
  }

  const handleUpdateAccount = (accountId: string) => (value: boolean) => {
    updateAccount(accountId, value)
    window.electronAPI.autoPinUrnsUpdate(accountId, value)
  }

  return {
    accounts,
    accountSelectorIsDisabled,
    options,
    selectedAccounts,

    customFilter,
    handleRemoveAccount,
    handleUpdateAccount,
    onSelectItem,
  }
}
