import type { ChangeEventHandler, FormEventHandler } from 'react'
import type {
  AccountBasicInfo,
  AccountData,
} from '../../../types/accounts'
import type { SelectOption } from '../../../components/ui/third-party/extended/input-tags'

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

export function useDisplayNameInputField({
  defaultValue,
}: {
  defaultValue?: string
}) {
  const [customDisplayName, setCustomDisplayName] = useState(
    defaultValue ?? ''
  )

  const onChangeInputDisplayNameValue: ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    setCustomDisplayName(event.currentTarget.value.replace(/\s+/g, ' '))
  }

  return {
    customDisplayName,

    onChangeInputDisplayNameValue,
  }
}

export function useTagsInputField({
  defaultValue,
}: {
  defaultValue?: Array<SelectOption>
}) {
  const [currentTags, setTagsValue] = useState(defaultValue ?? [])

  const onChangeInputTagsValue = (value: Array<SelectOption>) => {
    setTagsValue(value)
  }

  return {
    currentTags,

    onChangeInputTagsValue,
  }
}

export function useActions() {
  const addOrUpdate = useAccountListStore((state) => state.addOrUpdate)

  const [
    isPendingSubmitCustomDisplayName,
    setIsPendingSubmitCustomDisplayName,
  ] = useState(false)
  const _tmpAccount = useRef<AccountBasicInfo | null>(null)

  useEffect(() => {
    const listener = window.electronAPI.responseCustomDisplayName(
      async () => {
        if (_tmpAccount.current) {
          addOrUpdate(_tmpAccount.current.accountId, _tmpAccount.current)
        }

        _tmpAccount.current = null

        setIsPendingSubmitCustomDisplayName(false)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const onSubmitCustomDisplayName =
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

      if (isPendingSubmitCustomDisplayName) {
        return
      }

      _tmpAccount.current = {
        ...account,
        customDisplayName: value.trim(),
      }

      setIsPendingSubmitCustomDisplayName(true)
      window.electronAPI.updateCustomDisplayName(_tmpAccount.current)
    }

  return {
    isPendingSubmitCustomDisplayName,

    onSubmitCustomDisplayName,
  }
}
