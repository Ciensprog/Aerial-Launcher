import { useShallow } from 'zustand/react/shallow'

import {
  defaultFriendsSummary,
  useFriendsStore,
} from '../../state/management/friends'

import { useGetAccounts } from '../accounts'

export function useFriendsManagement() {
  const { accounts, selected, changeSelection } = useFriendsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      selected: state.selected,

      changeSelection: state.changeSelection,
    }))
  )

  return {
    accounts,
    defaultFriendsSummary,
    selected,

    changeSelection,
  }
}

export function useFriendsManagementActions() {
  const { accountList } = useGetAccounts()
  const {
    isLoading,
    selected,
    getSummary,
    removeFriends,
    syncBlocklist,
    syncIncoming,
    syncOutgoing,
    syncSummary,
    updateLoading,
  } = useFriendsStore(
    useShallow((state) => ({
      isLoading: state.isLoading,
      selected: state.selected,

      getSummary: state.getSummary,
      removeFriends: state.removeFriends,
      syncBlocklist: state.syncBlocklist,
      syncIncoming: state.syncIncoming,
      syncOutgoing: state.syncOutgoing,
      syncSummary: state.syncSummary,
      updateLoading: state.updateLoading,
    }))
  )

  const account = selected ? accountList[selected] ?? null : null

  return {
    account,
    isLoading,
    selected,

    getSummary,
    removeFriends,
    syncBlocklist,
    syncIncoming,
    syncOutgoing,
    syncSummary,
    updateLoading,
  }
}
