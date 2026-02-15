import type {
  ComboboxOption,
  ComboboxProps,
} from '../../../components/ui/extended/combobox/hooks'
import type { TaxiServiceAccountData } from '../../../types/taxi-service'

import { useEffect } from 'react'

import { useAutomationStore } from '../../../state/stw-operations/automation'

import {
  useGetTaxiServiceActions,
  useGetTaxiServiceData,
} from '../../../hooks/stw-operations/taxi-service'
import { useGetAccounts } from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'

import { checkIfCustomDisplayNameIsValid } from '../../../lib/validations/properties'
import { parseCustomDisplayName } from '../../../lib/utils'

export function useTaxiServiceData() {
  const { accountsArray, accountList } = useGetAccounts()
  const { getGroupTagsByAccountId } = useGetGroups()
  const { selectedAccounts } = useGetTaxiServiceData()
  const automationAccounts = useAutomationStore((state) => state.accounts)
  const {
    addAccount,
    removeAccount,
    updateAccountAction,
    updateAccountStatus,
    updateAccountSubmitting,
  } = useGetTaxiServiceActions()

  const options = accountsArray
    .filter(
      (account) =>
        !selectedAccounts[account.accountId] &&
        !automationAccounts[account.accountId]
    )
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
  const accountSelectorIsDisabled = options.length <= 0

  useEffect(() => {
    const listener =
      window.electronAPI.notificationTaxiServiceServiceStart(
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

  useEffect(() => {
    const listener =
      window.electronAPI.notificationTaxiServiceServiceRemove(
        async (accountId) => {
          removeAccount(accountId)
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
    window.electronAPI.taxiServiceServiceStart(accountId)
  }

  const handleRemoveAccount = (accountId: string) => () => {
    updateAccountSubmitting('removing', {
      accountId,
      value: true,
    })
    window.electronAPI.taxiServiceServiceRemove(accountId)
  }

  const handleReloadAccounts = (ids: Array<string>) => () => {
    ids.forEach((accountId) => {
      updateAccountSubmitting('connecting', {
        accountId,
        value: true,
      })
    })
    window.electronAPI.taxiServiceServiceReload(ids)
  }

  const handleUpdateStatusAction =
    (type: keyof TaxiServiceAccountData['actions'], accountId: string) =>
    (value: boolean | string) => {
      updateAccountAction(type, {
        accountId,
        value,
      })
      window.electronAPI.taxiServiceServiceUpdateAction(accountId, {
        type,
        value,
      })
    }

  return {
    accounts,
    accountSelectorIsDisabled,
    options,
    selectedAccounts,

    customFilter,
    handleReloadAccounts,
    handleRemoveAccount,
    handleUpdateStatusAction,
    onSelectItem,
  }
}
