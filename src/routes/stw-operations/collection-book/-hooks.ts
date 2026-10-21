import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetCollectionBookActions,
  useGetCollectionBookData,
} from '../../../hooks/stw-operations/collection-book'
import { useGetAccounts } from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'
import type { CollectionBookSectionId } from '../../../types/collection-book'

export function useCollectionBookPage() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const { accountsArray } = useGetAccounts()
  const {
    accounts,
    tags,
    isLoading,
    isActing,
    data,
    lastResult,
  } = useGetCollectionBookData()
  const {
    updateAccounts,
    updateTags,
    updateLoading,
    updateActing,
    updateData,
    clearData,
    setLastResult,
  } = useGetCollectionBookActions()

  const {
    accounts: accountOptions,
    areThereAccounts,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags: tagOptions,
    getAccounts,
  } = useAccountSelectorData({
    selectedAccounts: accounts,
    selectedTags: tags,
  })

  const isDisabledForm =
    isSelectedEmpty || isLoading || isActing || !areThereAccounts

  const accountsData = useMemo(
    () =>
      accountsArray
        .filter((account) => data[account.accountId] !== undefined)
        .map((account) => data[account.accountId]),
    [accountsArray, data],
  )

  useEffect(() => {
    const responseListener =
      window.electronAPI.collectionBookResponseData(async (payload) => {
        updateData(payload)
      })
    const loadingListener =
      window.electronAPI.collectionBookLoadingDone(async () => {
        updateLoading(false)
      })
    const resultListener =
      window.electronAPI.collectionBookActionResult(async (result) => {
        updateActing(false)
        setLastResult(result)
      })

    return () => {
      responseListener.removeListener()
      loadingListener.removeListener()
      resultListener.removeListener()
    }
  }, [updateActing, updateData, updateLoading, setLastResult])

  const handleLoad = () => {
    if (isDisabledForm) {
      if (isSelectedEmpty || !areThereAccounts) {
        toast(t('form.accounts.no-linked', { ns: 'general' }))
      }
      return
    }

    const selected = getAccounts()
    if (selected.length <= 0) {
      toast(t('form.accounts.no-linked', { ns: 'general' }))
      return
    }

    updateLoading(true)
    clearData()
    window.electronAPI.collectionBookRequestData(selected)
  }

  const handleUpgradeItems = (
    accountId: string,
    itemIds: Array<string>,
    level: number,
  ) => {
    if (isActing || itemIds.length <= 0) return
    updateActing(true)
    window.electronAPI.collectionBookUpgrade({
      accountId,
      itemIds,
      targetLevel: level,
    })
  }

  const handleUpgradeSection = (
    accountId: string,
    sectionId: string,
    level: number,
  ) => {
    if (isActing) return
    updateActing(true)
    window.electronAPI.collectionBookUpgrade({
      accountId,
      sectionId,
      targetLevel: level,
    })
  }

  const handleSlotItem = (accountId: string, itemId: string) => {
    if (isActing) return
    updateActing(true)
    window.electronAPI.collectionBookSlot({
      accountId,
      itemIds: [itemId],
    })
  }

  const handleSlotSection = (
    accountId: string,
    sectionId: CollectionBookSectionId,
  ) => {
    if (isActing) return
    const accountData = data[accountId]
    if (!accountData) return

    const itemIds = accountData.items
      .filter(
        (item) =>
          item.sectionId === sectionId &&
          item.state === 'armory' &&
          Boolean(item.itemId),
      )
      .map((item) => item.itemId)

    if (itemIds.length <= 0) return

    updateActing(true)
    window.electronAPI.collectionBookSlot({
      accountId,
      itemIds,
    })
  }

  return {
    accountOptions,
    areThereAccounts,
    isDisabledForm,
    isLoading,
    isActing,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tagOptions,
    accountsData,
    lastResult,

    updateAccounts,
    updateTags,
    handleLoad,
    handleUpgradeSection,
    handleUpgradeItems,
    handleSlotItem,
    handleSlotSection,
  }
}
