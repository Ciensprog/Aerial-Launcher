import type { AccountData } from '../../types/accounts'

import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useAccountListStore } from '../../state/accounts/list'

import { useGetGroups } from '../../hooks/groups'

import { checkIfCustomDisplayNameIsValid } from '../../lib/validations/properties'

export function useAccountList() {
  const { accountList, changeSelected, selected } = useAccountListStore(
    useShallow((state) => ({
      accountList: state.accounts,
      changeSelected: state.changeSelected,
      selected: state.getSelected(),
    }))
  )
  const { getGroupTagsByAccountId } = useGetGroups()
  const [open, setOpen] = useState(false)
  const accounts = Object.values(accountList)

  const createKeywords = (account: AccountData) => {
    const _keys: Array<string> = [account.displayName]
    const provider = account.provider ?? ''
    const tags = getGroupTagsByAccountId(account.accountId)

    if (checkIfCustomDisplayNameIsValid(account.customDisplayName)) {
      _keys.push(account.customDisplayName as string)
    }

    if (provider !== '') {
      _keys.push(provider)
    }

    if (tags.length > 0) {
      tags.forEach((tagName) => {
        _keys.push(tagName)
      })
    }

    return _keys.length > 0 ? _keys : undefined
  }

  const customFilter = (
    _value: string,
    search: string,
    keywords?: Array<string>
  ) => {
    const _search = search.toLowerCase().trim()
    const _keys =
      keywords &&
      keywords.some((keyword) =>
        keyword.toLowerCase().trim().includes(_search)
      )

    return _keys ? 1 : 0
  }
  const onSelect = (account: AccountData) => (accountId: string) => {
    if (accountId !== selected?.accountId) {
      changeSelected(account.accountId)
    }

    setOpen(false)
  }

  return {
    accounts,
    open,
    selected,

    createKeywords,
    customFilter,
    onSelect,
    setOpen,
  }
}
