import type {
  ComboboxOption,
  ComboboxProps,
} from '../components/ui/extended/combobox/hooks'
import type { AccountDataRecord } from '../types/accounts'

import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useShallow } from 'zustand/react/shallow'

import {
  AddAccountsLoadingsState,
  useAddAccountsStore,
} from '../state/accounts/add'
import { useAccountListStore } from '../state/accounts/list'
import { useGetGroups } from './groups'

import { checkIfCustomDisplayNameIsValid } from '../lib/validations/properties'
import { parseCustomDisplayName } from '../lib/utils'

export function useGetSelectedAccount() {
  const { selected } = useAccountListStore(
    useShallow((state) => ({
      currentSelected: state.selected,
      selected: state.getSelected(),
    }))
  )

  return { selected }
}

export function useGetAccounts() {
  const { accountList, idsList } = useAccountListStore(
    useShallow((state) => ({
      accountList: state.accounts,
      idsList: state.idsList,
    }))
  )
  const accountsArray = Object.values(accountList)

  return { accountsArray, accountList, idsList }
}

export function useRemoveSelectedAccount() {
  const removeAccount = useAccountListStore((state) => state.remove)

  return { removeAccount }
}

export function useRegisterAccounts() {
  const { accounts, idsList, registerAccounts } = useAccountListStore(
    useShallow((state) => ({
      accounts: state.accounts,
      idsList: state.idsList,
      registerAccounts: state.register,
    }))
  )

  const reorderAccounts = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = idsList.indexOf(active.id as string)
      const newIndex = idsList.indexOf((over?.id as string) ?? '')

      const newOrderIds = arrayMove(idsList, oldIndex, newIndex)
      const newRecord = newOrderIds.reduce((accumulator, accountId) => {
        if (accountId) {
          accumulator[accountId] = accounts[accountId]
        }

        return accumulator
      }, {} as AccountDataRecord)

      registerAccounts(newRecord, true)
      window.electronAPI.syncAccountsOrdering(newRecord)
    }
  }

  return { idsList, registerAccounts, reorderAccounts }
}

export function useAddAccountUpdateSubmittingState(
  type: keyof AddAccountsLoadingsState
) {
  const { isSubmitting, updateLoadingStatus } = useAddAccountsStore(
    useShallow((state) => ({
      isSubmitting: state[type],
      updateLoadingStatus: state.updateLoadingStatus,
    }))
  )

  const updateSubmittingState = (value: boolean) => {
    updateLoadingStatus(type, value)
  }

  return { isSubmitting, updateSubmittingState }
}

export function useGetComboboxAccounts<
  Data extends Record<string, unknown>,
>({ selected }: { selected: Data }) {
  const { accountsArray, accountList, idsList } = useGetAccounts()
  const { getGroupTagsByAccountId } = useGetGroups()

  const selectedAccounts = idsList.reduce(
    (accumulator, accountId) => {
      if (selected[accountId] !== undefined) {
        accumulator[accountId] = selected[accountId]
      }

      return accumulator
    },
    {} as Record<string, unknown>
  )
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
  const accountSelectorIsDisabled = options.length <= 0

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

  return {
    accountList,
    accounts,
    options,
    accountSelectorIsDisabled,
    selectedAccounts: selectedAccounts as Data,

    customFilter,
  }
}
