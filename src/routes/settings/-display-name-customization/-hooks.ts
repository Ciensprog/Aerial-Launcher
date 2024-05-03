import type { ChangeEventHandler, FormEventHandler } from 'react'
import type {
  AccountBasicInfo,
  AccountData,
} from '../../../types/accounts'

import { useEffect, useRef, useState } from 'react'

import { useAccountListStore } from '../../../state/accounts/list'

import { useGetAccounts } from '../../../hooks/accounts'

export function useAccounts() {
  const { accountsArray } = useGetAccounts()
  const [searchValue, setSearchValue] = useState('')

  const accounts =
    searchValue.length > 0
      ? accountsArray.filter((account) => {
          const currentSearchValue = searchValue.trim()

          return (
            account.displayName
              .toLowerCase()
              .includes(currentSearchValue) ||
            account.customDisplayName
              ?.toLowerCase()
              .includes(currentSearchValue)
          )
        })
      : accountsArray

  const onChangeSearchValue: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setSearchValue(event.currentTarget.value.replace(/\s+/g, ' '))
  }

  return {
    accounts,
    accountsArray,
    searchValue,

    onChangeSearchValue,
  }
}

export function useInputField({
  defaultValue,
}: {
  defaultValue?: string
}) {
  const [value, setValue] = useState(defaultValue ?? '')

  const onChangeInputValue: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setValue(event.currentTarget.value.replace(/\s+/g, ' '))
  }

  return {
    value,

    onChangeInputValue,
  }
}

export function useActions() {
  const addOrUpdate = useAccountListStore((state) => state.addOrUpdate)

  const [isPending, setIsPending] = useState(false)
  const _tmpAccount = useRef<AccountBasicInfo | null>(null)

  useEffect(() => {
    const listener = window.electronAPI.responseCustomDisplayName(
      async () => {
        if (_tmpAccount.current) {
          addOrUpdate(_tmpAccount.current.accountId, _tmpAccount.current)
        }

        _tmpAccount.current = null

        setIsPending(false)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const onSubmit =
    ({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      account: { provider, token, ...account },
      value,
    }: {
      account: AccountData
      value: string
    }): FormEventHandler =>
    (event) => {
      event.preventDefault()

      _tmpAccount.current = {
        ...account,
        customDisplayName: value.trim(),
      }

      setIsPending(true)
      window.electronAPI.updateCustomDisplayName(_tmpAccount.current)
    }

  return {
    isPending,

    onSubmit,
  }
}
