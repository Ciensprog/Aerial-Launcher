import type { ChangeEventHandler, FormEventHandler } from 'react'
import type {
  ComboboxOption,
  ComboboxProps,
} from '../../../components/ui/extended/combobox/hooks'
import type { PartyCommonSelectorState } from '../../../state/stw-operations/party'
import type { AccountData } from '../../../types/accounts'
import type {
  PartyIncomingFriendRequest,
  PartyPlayerLookupResponse,
} from '../../../types/party'

import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'

import { useGetAccounts } from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'
import { useClaimedRewards } from '../../../hooks/stw-operations/claimed-rewards'
import {
  useInviteFriendsForm,
  usePartyFriendsForm,
  useSendFriendRequestForm,
} from '../../../hooks/stw-operations/party'

import { checkIfCustomDisplayNameIsValid } from '../../../lib/validations/properties'
import { toast } from '../../../lib/notifications'
import {
  // localeCompareForSorting,
  parseCustomDisplayName,
} from '../../../lib/utils'

export function useComboboxAccounts({
  value,
}: Pick<PartyCommonSelectorState, 'value'>) {
  const { accountsArray } = useGetAccounts()
  const { getGroupTagsByAccountId } = useGetGroups()

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
      label: parseCustomDisplayName(account)!,
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

    customFilter,
  }
}

export function useKickActions({
  callbackName,
  claimState,
  value,
}: {
  callbackName: 'notificationKick' | 'notificationLeave'
  claimState: boolean
  value: Array<ComboboxOption>
}) {
  const { t } = useTranslation(['stw-operations'])

  const { accountsArray, accountList } = useGetAccounts()
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const listener = window.electronAPI[callbackName](async (total) => {
      setIsPending(false)

      toast(
        total === 0
          ? t('party.kick.notifications.nothing')
          : t('party.kick.notifications.success', {
              total,
            })
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
        window.electronAPI.leaveParty(accounts, accountsArray, claimState)
      } else {
        window.electronAPI.kickPartyMembers(
          accounts[0],
          accountsArray,
          claimState
        )
      }
    }
  }

  return {
    isPending,

    onKick,
  }
}

export function useClaimActions({
  value,
}: {
  value: Array<ComboboxOption>
}) {
  const { t } = useTranslation(['stw-operations'])

  const { accountList } = useGetAccounts()
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const listener = window.electronAPI.notificationClaimRewards(
      async () => {
        setIsPending(false)

        toast(t('party.claim.notifications.success'))
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const onClaim = () => {
    if (isPending) {
      return
    }

    const accounts = value
      .map((option) => accountList[option.value])
      .filter((account) => account !== undefined)

    if (accounts.length > 0) {
      setIsPending(true)

      window.electronAPI.claimRewards(accounts)
    }
  }

  return {
    isPending,

    onClaim,
  }
}

export function useClaimedRewardsNotifications() {
  const { updateData } = useClaimedRewards()

  useEffect(() => {
    const listener = window.electronAPI.notificationClaimedRewards(
      async (notifications) => {
        updateData(notifications)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])
}

export function useInviteActions({
  selected,
}: {
  selected: AccountData | null
}) {
  const { t } = useTranslation(['stw-operations'])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [friendsListVersion, setFriendsListVersion] = useState(0)
  const { friends } = usePartyFriendsForm()
  const { setValue, value } = useInviteFriendsForm()

  const friendOptions: Array<ComboboxOption> = Object.values(friends)
    .toSorted((itemA, itemB) => itemB.invitations - itemA.invitations)
    .map((item) => ({
      keywords: [item.displayName],
      label: item.displayName,
      value: item.accountId,
    }))

  useEffect(() => {
    const listener = window.electronAPI.notificationAddNewFriend(
      async ({ displayName, errorMessage, success }) => {
        if (success) {
          setFriendsListVersion((version) => version + 1)
        }

        setIsSubmitting(false)

        toast(
          success
            ? t('party.friends.notifications.added.success', {
                name: displayName,
              })
            : errorMessage
              ? errorMessage
              : t('party.friends.notifications.added.default-error', {
                  name: displayName,
                })
        )
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.notificationRemoveFriend(
      async ({ displayName, status }) => {
        setValue(value.filter((item) => friends[item.value] !== undefined))
        setIsSubmitting(false)

        toast(
          status
            ? t('party.friends.notifications.remove.success', {
                name: displayName,
              })
            : t('party.friends.notifications.remove.default-error', {
                name: displayName,
              })
        )
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.notificationInvite(
      async (response) => {
        setIsInviting(false)

        if (response.length <= 0) {
          toast(t('party.friends.notifications.invite.error'))
        } else {
          const totalInvitations = response.filter(
            (item) => item.type === 'invite'
          ).length
          const totalFriendRequests = response.filter(
            (item) => item.type === 'friend-request'
          ).length
          const messages: Array<string> = []

          if (totalInvitations > 0) {
            messages.push(
              t('party.friends.notifications.invite.sent', {
                count: totalInvitations,
              })
            )
          }

          if (totalFriendRequests > 0) {
            messages.push(
              t('party.friends.notifications.request.sent', {
                count: totalFriendRequests,
              })
            )
          }

          toast(messages.join('. '))
        }
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleAddNewFriend = (displayName: string) => () => {
    if (isSubmitting || !selected) {
      return
    }

    setIsSubmitting(true)

    window.electronAPI.addNewFriend(selected, displayName)
  }

  const handleInvite = (value: Array<ComboboxOption>) => () => {
    if (value.length <= 0 || !selected || isInviting) {
      return
    }

    const accountIds = [...new Set(value.map(({ value }) => value))]

    setIsInviting(true)

    window.electronAPI.invite(selected, accountIds)
  }

  const handleRemoveFriend =
    (data: { accountId: string; displayName: string }) => () => {
      if (isSubmitting) {
        return
      }

      setIsSubmitting(true)

      window.electronAPI.removeFriend(data)
    }

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
    friendsListVersion,
    isInviting,
    isSubmitting,
    friendOptions,

    customFilter,
    handleAddNewFriend,
    handleInvite,
    handleRemoveFriend,
  }
}

export function useFriendRequestActions() {
  const { t } = useTranslation(['stw-operations', 'general'])
  const { accountList } = useGetAccounts()
  const { hasValues, setValue, value } = useSendFriendRequestForm()
  const { customFilter, options } = useComboboxAccounts({
    value,
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetTab, setSheetTab] = useState<'search' | 'incoming'>('search')
  const [inputSearchDisplayName, setInputSearchDisplayName] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(
    null
  )
  const pendingActionRef = useRef<'send' | 'accept' | null>(null)
  const [searchedUser, setSearchedUser] =
    useState<PartyPlayerLookupResponse | null>(null)
  const [incomingRequests, setIncomingRequests] = useState<
    Array<PartyIncomingFriendRequest>
  >([])
  const [isIncomingLoading, setIsIncomingLoading] = useState(false)
  const [pendingIncomingKey, setPendingIncomingKey] = useState<
    string | null
  >(null)
  const incomingLoadedRef = useRef(false)

  const selectedAccounts = value
    .map((option) => accountList[option.value])
    .filter((account) => account !== undefined)

  const isBusy =
    isSearching ||
    pendingAccountId !== null ||
    pendingIncomingKey !== null

  const inputSearchButtonIsDisabled =
    isBusy ||
    inputSearchDisplayName.trim() === '' ||
    selectedAccounts.length <= 0

  useEffect(() => {
    const listener = window.electronAPI.notificationLookupPartyPlayer(
      async (response) => {
        setIsSearching(false)
        setSearchedUser(response)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.notificationSendFriendRequests(
      async (response) => {
        const action = pendingActionRef.current

        pendingActionRef.current = null
        setPendingAccountId(null)
        setPendingIncomingKey(null)

        if (response.length <= 0) {
          toast(t('party.friends.notifications.request.error'))
        } else if (action === 'accept') {
          toast(t('party.friend-requests.sheet.accepted'))
        } else {
          toast(
            t('party.friends.notifications.request.sent', {
              count: response.length,
            })
          )
        }

        const accounts = value
          .map((option) => accountList[option.value])
          .filter((account) => account !== undefined)

        if (accounts.length > 0 && inputSearchDisplayName.trim() !== '') {
          setIsSearching(true)
          window.electronAPI.lookupPartyPlayer(
            accounts,
            inputSearchDisplayName
          )
        }

        if (accounts.length > 0 && incomingLoadedRef.current) {
          setIsIncomingLoading(true)
          window.electronAPI.requestIncomingFriendRequests(accounts)
        }
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [accountList, inputSearchDisplayName, t, value])

  useEffect(() => {
    const listener = window.electronAPI.notificationIncomingFriendRequests(
      async (requests) => {
        setIncomingRequests(requests)
        setIsIncomingLoading(false)
        incomingLoadedRef.current = true
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleChangeSearchDisplayName: ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    setInputSearchDisplayName(event.target.value)
  }

  const handleSearchUser: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    if (inputSearchButtonIsDisabled) {
      return
    }

    setIsSearching(true)
    setSearchedUser(null)
    window.electronAPI.lookupPartyPlayer(
      selectedAccounts,
      inputSearchDisplayName
    )
  }

  const handleAccountAction = (accountId: string) => {
    if (!searchedUser?.success || pendingAccountId !== null) {
      return
    }

    const friendship = searchedUser.data.friendships.find(
      (item) => item.accountId === accountId
    )
    const account = accountList[accountId]

    if (
      !account ||
      !friendship ||
      (friendship.status !== 'not-friends' &&
        friendship.status !== 'incoming')
    ) {
      return
    }

    const action = friendship.status === 'incoming' ? 'accept' : 'send'

    pendingActionRef.current = action
    setPendingAccountId(accountId)
    window.electronAPI.sendFriendRequests(
      [account],
      searchedUser.data.lookup.id
    )
  }

  const loadIncomingRequests = () => {
    if (selectedAccounts.length <= 0) {
      return
    }

    setIsIncomingLoading(true)
    window.electronAPI.requestIncomingFriendRequests(selectedAccounts)
  }

  const handleSheetTabChange = (tab: 'search' | 'incoming') => {
    setSheetTab(tab)

    if (tab === 'incoming' && !incomingLoadedRef.current) {
      loadIncomingRequests()
    }
  }

  const handleAcceptIncoming = (request: PartyIncomingFriendRequest) => {
    const account = accountList[request.accountId]

    if (!account || pendingIncomingKey !== null || pendingAccountId !== null) {
      return
    }

    pendingActionRef.current = 'accept'
    setPendingIncomingKey(`${request.accountId}:${request.friendId}`)
    window.electronAPI.sendFriendRequests([account], request.friendId)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)

    if (!open) {
      setSearchedUser(null)
      setInputSearchDisplayName('')
      pendingActionRef.current = null
      setPendingAccountId(null)
      setSheetTab('search')
      setIncomingRequests([])
      setIsIncomingLoading(false)
      setPendingIncomingKey(null)
      incomingLoadedRef.current = false
    }
  }

  return {
    customFilter,
    dialogOpen,
    hasValues,
    incomingRequests,
    inputSearchButtonIsDisabled,
    inputSearchDisplayName,
    isBusy,
    isIncomingLoading,
    isSearching,
    options,
    pendingAccountId,
    pendingIncomingKey,
    searchedUser,
    selectedAccounts,
    sheetTab,
    value,

    handleAcceptIncoming,
    handleAccountAction,
    handleChangeSearchDisplayName,
    handleDialogOpenChange,
    handleSearchUser,
    handleSheetTabChange,
    setDialogOpen,
    setValue,
  }
}
