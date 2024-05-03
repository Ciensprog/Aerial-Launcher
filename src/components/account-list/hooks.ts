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
    const _keys: Array<string> = []
    const customDisplayName = account.customDisplayName?.trim() ?? ''
    const displayName = account.displayName
    const provider = account.provider ?? ''

    // [account.customDisplayName, account.provider]

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
    value: string,
    search: string,
    keywords?: Array<string>
  ) => {
    const _value = value.toLowerCase()
    const _search = search.toLowerCase()
    const _provider =
      keywords &&
      keywords.some((keyword) => keyword.toLowerCase().includes(_search))

    return _value.includes(_search) || _provider ? 1 : 0
  }
  const onSelect = (account: AccountData) => (displayName: string) => {
    if (displayName !== selected?.displayName) {
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
