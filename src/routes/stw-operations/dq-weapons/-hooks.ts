import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetDqWeaponsActions,
  useGetDqWeaponsData,
} from '../../../hooks/stw-operations/dq-weapons'
import { useGetAccounts } from '../../../hooks/accounts'
import { useDqWeaponsStore } from '../../../state/stw-operations/dq-weapons'

import { toast } from '../../../lib/notifications'

export function useDqWeaponsPage() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const { results, isLoading, isFavoriting } = useDqWeaponsStore(
    useShallow((state) => ({
      results: state.results,
      isLoading: state.isLoading,
      isFavoriting: state.isFavoriting,
    }))
  )
  const setLoading = useDqWeaponsStore((state) => state.setLoading)
  const setFavoriting = useDqWeaponsStore((state) => state.setFavoriting)

  const { accountList } = useGetAccounts()
  const { selectedAccounts, selectedTags } = useGetDqWeaponsData()
  const { dqWeaponsUpdateAccounts, dqWeaponsUpdateTags } =
    useGetDqWeaponsActions()
  const {
    accounts,
    areThereAccounts,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    getAccounts,
  } = useAccountSelectorData({
    selectedAccounts,
    selectedTags,
  })

  const busy = isLoading || isFavoriting
  const fetchButtonIsDisabled = isSelectedEmpty || busy || !areThereAccounts
  const favoriteButtonIsDisabled = fetchButtonIsDisabled

  useEffect(() => {
    const listener = window.electronAPI.notificationDqWeaponsFavorite(
      async (value) => {
        const favorited = value.reduce((sum, item) => sum + item.favorited, 0)
        const already = value.reduce((sum, item) => sum + item.already, 0)
        const failed = value.filter((item) => item.errorMessage).length

        if (favorited > 0) {
          toast(
            t('dq-weapons.favorite.done', {
              count: favorited,
            })
          )
        } else if (already > 0) {
          toast(t('dq-weapons.favorite.already'))
        } else if (failed > 0 || value.length <= 0) {
          toast(t('dq-weapons.favorite.error'))
        } else {
          toast(t('dq-weapons.favorite.empty'))
        }
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [t])

  const handleFetch = () => {
    if (fetchButtonIsDisabled) {
      return
    }

    const selected = getAccounts()

    if (selected.length <= 0) {
      toast(
        t('form.accounts.no-linked', {
          ns: 'general',
        })
      )

      return
    }

    setLoading(true)
    window.electronAPI.requestDqWeapons(selected)
  }

  const handleFavorite = () => {
    if (favoriteButtonIsDisabled) {
      return
    }

    const selected = getAccounts()

    if (selected.length <= 0) {
      toast(
        t('form.accounts.no-linked', {
          ns: 'general',
        })
      )

      return
    }

    setFavoriting(true)
    window.electronAPI.requestDqWeaponsFavorite(selected)
  }

  return {
    accounts,
    accountList,
    results,
    favoriteButtonIsDisabled,
    fetchButtonIsDisabled,
    isFavoriting,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    dqWeaponsUpdateAccounts,
    dqWeaponsUpdateTags,
    handleFavorite,
    handleFetch,
  }
}
