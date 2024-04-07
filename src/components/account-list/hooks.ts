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

    onSelect,
    setOpen,
  }
}
