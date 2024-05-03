import type { AccountData } from '../../types/accounts'

import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useAccountListStore } from '../../state/accounts/list'

export function useAccountList() {
  const { accountList, changeSelected, selected } = useAccountListStore(
    useShallow((state) => ({
      accountList: state.accounts,
      changeSelected: state.changeSelected,
      selected: state.getSelected(),
    }))
  )
  const [open, setOpen] = useState(false)
  const accounts = Object.values(accountList)

  const createKeywords = (account: AccountData) => {
    const _keys: Array<string> = [account.displayName]
    const customDisplayName = account.customDisplayName?.trim() ?? ''
    const displayName = account.displayName
    const provider = account.provider ?? ''

    if (customDisplayName !== '') {
      _keys.push(customDisplayName)
    }

    if (displayName !== '') {
      _keys.push(displayName)
    }

    if (provider !== '') {
      _keys.push(provider)
    }

    return _keys.length > 0 ? _keys : undefined
  }

  const customFilter = (
    _value: string,
    search: string,
    keywords?: Array<string>
  ) => {
    const _search = search.toLowerCase()
    const _keys =
      keywords &&
      keywords.some((keyword) => keyword.toLowerCase().includes(_search))

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
