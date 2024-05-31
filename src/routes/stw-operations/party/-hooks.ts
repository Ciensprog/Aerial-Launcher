import type {
  ComboboxOption,
  ComboboxProps,
} from '../../../components/ui/extended/combobox/hooks'

import { useEffect, useState } from 'react'

import { useGetAccounts } from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'

import { checkIfCustomDisplayNameIsValid } from '../../../lib/validations/properties'
import { toast } from '../../../lib/notifications'
import { parseDisplayName } from '../../../lib/utils'

export function useComboboxAccounts() {
  const { accountsArray } = useGetAccounts()
  const { getGroupTagsByAccountId } = useGetGroups()
  const [value, setValue] = useState<Array<ComboboxOption>>([])

  const hasValues = value.length > 0

  const options: Array<ComboboxOption> = accountsArray.map((account) => {
    const _keys: Array<string> = [account.displayName]
    const provider = account.provider ?? ''
    const tags = getGroupTagsByAccountId(account.accountId)

    if (checkIfCustomDisplayNameIsValid(account.customDisplayName)) {
      _keys.push(account.customDisplayName)
    }

    if (provider !== '') {
      _keys.push(provider)
    }

    if (tags.length > 0) {
      tags.forEach((tagName) => {
        _keys.push(tagName)
      })
    }

    return {
      label: parseDisplayName(account)!,
      value: account.accountId,
      keywords: _keys,
    }
  })

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
    hasValues,
    options,
    value,

    customFilter,
    setValue,
  }
}

export function useKickActions({
  callbackName,
  value,
}: {
  callbackName: 'notificationKick' | 'notificationLeave'
  value: Array<ComboboxOption>
}) {
  const { accountsArray, accountList } = useGetAccounts()
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const listener = window.electronAPI[callbackName](async (total) => {
      setIsPending(false)

      toast(
        total === 0
          ? 'No user has been kicked'
          : `Kicked ${total} user${total > 1 ? 's' : ''}`
      )
    })

    return () => {
      listener.removeListener()
    }
  }, [])

  const onKick = (isMulti?: true) => () => {
    if (isPending) {
      return
    }

    const accounts = value
      .map((option) => accountList[option.value])
      .filter((account) => account !== undefined)

    setIsPending(true)

    if (accounts.length > 0) {
      if (isMulti) {
        window.electronAPI.leaveParty(accounts, accountsArray)
      } else {
        window.electronAPI.kickPartyMembers(accounts[0], accountsArray)
      }
    }
  }

  return {
    isPending,

    onKick,
  }
}
