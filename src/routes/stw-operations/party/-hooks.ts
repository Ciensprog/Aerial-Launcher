import type {
  ComboboxOption,
  ComboboxProps,
} from '../../../components/ui/extended/combobox/hooks'
import type { PartyCommonSelectorState } from '../../../state/stw-operations/party'
import type { AccountData } from '../../../types/accounts'

import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { useGetAccounts } from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'
import { useClaimedRewards } from '../../../hooks/stw-operations/claimed-rewards'
import {
  useInviteFriendsForm,
  usePartyFriendsForm,
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
  const [inputSearchValue, setInputSearchValue] = useState('')
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
          setInputSearchValue('')
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
    inputSearchValue,
    isInviting,
    isSubmitting,
    friendOptions,

    customFilter,
    handleAddNewFriend,
    handleInvite,
    handleRemoveFriend,
    setInputSearchValue,
  }
}
