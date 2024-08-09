import type {
  ComboboxOption,
  ComboboxProps,
} from '../../../components/ui/extended/combobox/hooks'
import type { AutomationAccountData } from '../../../types/automation'

import {
  useGetAutomationActions,
  useGetAutomationData,
} from '../../../hooks/stw-operations/automation'
import { useGetAccounts } from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'

import { checkIfCustomDisplayNameIsValid } from '../../../lib/validations/properties'
import {
  localeCompareForSorting,
  parseCustomDisplayName,
} from '../../../lib/utils'
import { useEffect } from 'react'

export function useAutomationData() {
  const { accountsArray, accountList } = useGetAccounts()
  const { getGroupTagsByAccountId } = useGetGroups()
  const { selectedAccounts } = useGetAutomationData()
  const {
    addAccount,
    updateAccountAction,
    updateAccountStatus,
    updateAccountSubmitting,
  } = useGetAutomationActions()

  const options = accountsArray
    .filter((account) => !selectedAccounts[account.accountId])
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
    const listener = window.electronAPI.notificationAutomationServiceStart(
      async (response) => {
        updateAccountStatus(response.accountId, response.status)
        updateAccountSubmitting('connecting', {
          accountId: response.accountId,
          value: false,
        })
      }
    )

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
    updateAccountSubmitting('connecting', {
      accountId,
      value: true,
    })
    window.electronAPI.automationServiceStart(accountId)
  }

  const handleRemoveAccount = (accountId: string) => () => {
    updateAccountSubmitting('removing', {
      accountId,
      value: true,
    })
  }

  // const handleReloadAccount = (accountId: string) => () => {
  //   updateAccountSubmitting('connecting', {
  //     accountId,
  //     value: true,
  //   })
  //   window.electronAPI.automationServiceReload(accountId)
  // }

  const handleUpdateClaimAction =
    (type: keyof AutomationAccountData['actions'], accountId: string) =>
    (value: boolean) => {
      updateAccountAction(type, {
        accountId,
        value,
      })
    }

  return {
    accounts,
    accountSelectorIsDisabled,
    options,
    selectedAccounts,

    customFilter,
    // handleReloadAccount,
    handleRemoveAccount,
    handleUpdateClaimAction,
    onSelectItem,
  }
}
