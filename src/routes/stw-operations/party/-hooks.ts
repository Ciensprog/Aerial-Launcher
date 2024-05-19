import type { ComboboxOption } from '../../../components/ui/extended/combobox/hooks'

import { useState } from 'react'

import { defaultColor } from '../../../config/constants/colors'

import { useGetAccounts } from '../../../hooks/accounts'

import { parseDisplayName } from '../../../lib/utils'

export function useAccounts() {
  const { accountsArray } = useGetAccounts()

  const options = accountsArray.map((account) => ({
    label: parseDisplayName(account)!,
    value: account.accountId,
    color: defaultColor,
  }))

  return { options }
}

export function useComboboxSelections() {
  const [value, setValue] = useState<Array<ComboboxOption>>([])
  const hasValues = value.length > 0

  return {
    hasValues,
    value,

    setValue,
  }
}
