import type {
  ComboboxOption,
  ComboboxProps,
} from '../../../components/ui/extended/combobox/hooks'
import type {
  EpicAddFriend,
  EpicFriend,
  FriendBlock,
  FriendIncoming,
  FriendOutgoing,
  FriendsSummary,
} from '../../../types/services/friends'

import {
  useFriendsManagement,
  useFriendsManagementActions,
} from '../../../hooks/management/friends'
import { useGetAccounts } from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'

import { checkIfCustomDisplayNameIsValid } from '../../../lib/validations/properties'
import { parseCustomDisplayName } from '../../../lib/utils'

export function useAccountSelector() {
  const { accountsArray } = useGetAccounts()
  const { getGroupTagsByAccountId } = useGetGroups()
  const { accounts, defaultFriendsSummary, selected, changeSelection } =
    useFriendsManagement()

  const data: FriendsSummary = selected
    ? accounts[selected] ?? defaultFriendsSummary
    : defaultFriendsSummary

  const options = accountsArray.map((account) => {
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
  const currentSelection =
    options.filter((item) => selected && item.value === selected) ?? []
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
  const onChangeSelections = (values: Array<ComboboxOption>) => {
    if (values.length <= 0) {
      changeSelection(null)
    }
  }
  const onSelectItem = (value: string) => {
    changeSelection(value)
  }

  return {
    accountSelectorIsDisabled,
    currentSelection,
    data,
    options,
    selected,

    customFilter,
    onChangeSelections,
    onSelectItem,
  }
}

export function useFriendsActions() {
  const { account, isLoading, updateLoading } =
    useFriendsManagementActions()

  const getFriendsSummary = () => {
    if (!account) {
      return
    }

    updateLoading(true)

    window.electronAPI.requestFriendsSummary(account)
  }

  return {
    isLoading,

    getFriendsSummary,
  }
}

export function useFriendsTableActions() {
  const { account, getSummary } = useFriendsManagementActions()

  const handleBlock =
    (
      friends: Array<EpicFriend | FriendIncoming | FriendOutgoing>,
      context?: 'incoming' | 'outgoing'
    ) =>
    () => {
      if (!account) {
        return
      }

      window.electronAPI.requestBlockFriends(account, friends, context)
    }
  const handleUnblock =
    (unblocklist: 'full' | Array<FriendBlock>) => () => {
      if (!account) {
        return
      }

      const currentTotal = getSummary()?.blocklist.length ?? 0

      window.electronAPI.requestUnblockFriends(
        account,
        unblocklist !== 'full' && currentTotal === unblocklist.length
          ? 'full'
          : unblocklist
      )
    }

  const handleAdd =
    (friends: Array<EpicAddFriend>, context?: 'incoming') => () => {
      if (!account) {
        return
      }

      window.electronAPI.requestAddFriends(account, friends, context)
    }

  const handleRemove =
    (
      friends: 'full' | Array<EpicFriend | FriendOutgoing>,
      context?: 'incoming' | 'outgoing'
    ) =>
    () => {
      if (!account) {
        return
      }

      const currentTotal = getSummary()?.friends.length ?? 0

      window.electronAPI.requestRemoveFriends(
        account,
        friends !== 'full' && currentTotal === friends.length
          ? 'full'
          : friends,
        context
      )
    }

  return {
    handleBlock,
    handleUnblock,
    handleAdd,
    handleRemove,
  }
}
