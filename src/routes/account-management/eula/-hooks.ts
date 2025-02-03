import type { ChangeEventHandler } from 'react'

import { useEffect, useState } from 'react'

import { EULAAccountStatus } from '../../../state/accounts/eula'

import { useEULAData } from '../../../hooks/management/eula'
import { useGetAccounts } from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'

import { checkIfCustomDisplayNameIsValid } from '../../../lib/validations/properties'
import { toast } from '../../../lib/notifications'

export function useEULAActions() {
  const [searchValue, setSearchValue] = useState('')

  const { accountsArray } = useGetAccounts()
  const { getGroupTagsByAccountId } = useGetGroups()
  const { data, updateEULAAccountStatus } = useEULAData()

  const accounts =
    searchValue.length > 0
      ? accountsArray.filter((account) => {
          let keywords: Array<string> = [account.displayName]
          const tags = getGroupTagsByAccountId(account.accountId)

          if (checkIfCustomDisplayNameIsValid(account.customDisplayName)) {
            keywords.push(account.customDisplayName)
          }

          if (tags.length > 0) {
            tags.forEach((tagName) => {
              keywords.push(tagName)
            })
          }

          keywords = keywords.map((item) => item.toLowerCase())

          return keywords.some((keyword) =>
            keyword.trim().includes(searchValue.toLowerCase())
          )
        })
      : accountsArray

  useEffect(() => {
    const listener = window.electronAPI.eulaVerificationResponse(
      async (response) => {
        updateEULAAccountStatus(response)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleVerifyById = (accountId: string) => () => {
    updateEULAAccountStatus({
      [accountId]: {
        isLoading: true,
      },
    })
    window.electronAPI.eulaVerification([accountId])
  }

  const handleCopyUrl = (url: EULAAccountStatus['url']) => () => {
    if (!url) {
      return
    }

    window.navigator.clipboard
      .writeText(url)
      .then(() => {
        toast('URL has been copied into clipboard')
      })
      .catch(() => {})
  }

  const onChangeSearchValue: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setSearchValue(event.currentTarget.value.replace(/\s+/g, ' '))
  }

  return {
    accounts,
    accountsArray,
    data,
    searchValue,

    handleCopyUrl,
    handleVerifyById,
    onChangeSearchValue,
  }
}

export function useScrollToTop() {
  const [scrollToTopButtonIsVisible, setScrollToTopButtonIsVisible] =
    useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrollToTopButtonIsVisible(!entry.isIntersecting)
      },
      {
        threshold: [0],
      }
    )

    const $container = document.getElementById('gtk-eula')

    if ($container) {
      observer.observe($container)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const scrollButtonOnClick = () => {
    document.querySelector('.main-wrapper-content')?.scroll({
      behavior: 'smooth',
      top: 0,
    })
  }

  return {
    scrollToTopButtonIsVisible,
    scrollButtonOnClick,
  }
}
