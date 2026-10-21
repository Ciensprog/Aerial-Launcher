import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetAccountInfoActions,
  useGetAccountInfoData,
} from '../../../hooks/stw-operations/account-info'
import { useGetAccounts } from '../../../hooks/accounts'
import { useAccountInfoStore } from '../../../state/stw-operations/account-info'

import { toast } from '../../../lib/notifications'

import type { AccountInfoItem } from '../../../types/account-info'
import type { AccountData } from '../../../types/accounts'

export function useAccountInfoPage() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const { results, isLoading, isActing } = useAccountInfoStore(
    useShallow((state) => ({
      results: state.results,
      isLoading: state.isLoading,
      isActing: state.isActing,
    }))
  )
  const setLoading = useAccountInfoStore((state) => state.setLoading)
  const setActing = useAccountInfoStore((state) => state.setActing)

  const { accountList } = useGetAccounts()
  const { selectedAccounts, selectedTags } = useGetAccountInfoData()
  const { accountInfoUpdateAccounts, accountInfoUpdateTags } =
    useGetAccountInfoActions()
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

  const [viewAccountId, setViewAccountId] = useState<string | null>(null)
  const [inventoryTab, setInventoryTab] = useState<
    'backpack' | 'storage' | 'ventures'
  >('backpack')
  const [filter, setFilter] = useState<
    'all' | 'weapon' | 'trap' | 'resource'
  >('all')
  const [combineStacks, setCombineStacks] = useState(false)
  const [selectedItem, setSelectedItem] = useState<AccountInfoItem | null>(
    null
  )

  const busy = isLoading || isActing
  const fetchButtonIsDisabled = isSelectedEmpty || busy || !areThereAccounts

  const current = useMemo(() => {
    if (results.length <= 0) {
      return null
    }

    return (
      results.find((item) => item.accountId === viewAccountId) ??
      results[0] ??
      null
    )
  }, [results, viewAccountId])

  const inventoryItems = useMemo(() => {
    if (!current) {
      return []
    }

    const source =
      inventoryTab === 'storage'
        ? current.storage
        : inventoryTab === 'ventures'
          ? (current.ventures ?? [])
          : current.backpack

    const list =
      filter === 'all'
        ? source
        : filter === 'weapon'
          ? source.filter(
              (item) => item.kind === 'weapon' || item.kind === 'gadget'
            )
          : source.filter((item) => item.kind === filter)

    if (!combineStacks) {
      return list
    }

    const merged = new Map<string, AccountInfoItem>()

    list.forEach((item) => {
      const key = item.templateId.toLowerCase()
      const currentItem = merged.get(key)

      if (!currentItem) {
        merged.set(key, { ...item })
        return
      }

      currentItem.quantity += item.quantity

      if (item.power > currentItem.power) {
        currentItem.power = item.power
        currentItem.level = item.level
        currentItem.alterations = item.alterations
        currentItem.itemId = item.itemId
        currentItem.meta = item.meta
        currentItem.rarity = item.rarity
      }
    })

    return Array.from(merged.values())
  }, [combineStacks, current, filter, inventoryTab])

  useEffect(() => {
    if (results.length <= 0) {
      return
    }

    if (
      !viewAccountId ||
      !results.some((item) => item.accountId === viewAccountId)
    ) {
      setViewAccountId(results[0]?.accountId ?? null)
    }
  }, [results, viewAccountId])

  useEffect(() => {
    setSelectedItem(null)
    setFilter('all')
  }, [viewAccountId, inventoryTab])

  useEffect(() => {
    setSelectedItem(null)
  }, [combineStacks])

  useEffect(() => {
    const listener = window.electronAPI.notificationAccountInfoAction(
      async (value) => {
        if (value.success) {
          toast(
            t(
              value.action === 'recycle'
                ? 'account-info.toast.recycled'
                : 'account-info.toast.upgraded'
            )
          )
          setSelectedItem(null)
        } else {
          toast(t('account-info.toast.error'))
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
    window.electronAPI.requestAccountInfo(selected)
  }

  const accountForId = (accountId: string): AccountData | null => {
    return accountList[accountId] ?? null
  }

  const handleRecycle = (item: AccountInfoItem) => {
    const account = current ? accountForId(current.accountId) : null

    if (!account || busy) {
      return
    }

    setActing(true)
    window.electronAPI.requestAccountInfoRecycle(
      account,
      item.itemId,
      item.profileId
    )
  }

  const handleUpgrade = (item: AccountInfoItem) => {
    const account = current ? accountForId(current.accountId) : null

    if (!account || busy) {
      return
    }

    setActing(true)
    window.electronAPI.requestAccountInfoUpgrade(
      account,
      item.itemId,
      item.profileId
    )
  }

  const handleChangePerks = () => {
    toast(t('account-info.inspect.perks-soon'))
  }

  return {
    accounts,
    accountList,
    results,
    current,
    inventoryItems,
    inventoryTab,
    filter,
    combineStacks,
    selectedItem,
    viewAccountId,
    fetchButtonIsDisabled,
    isLoading,
    isActing,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    accountInfoUpdateAccounts,
    accountInfoUpdateTags,
    handleFetch,
    handleRecycle,
    handleUpgrade,
    handleChangePerks,
    setFilter,
    setCombineStacks,
    setInventoryTab,
    setSelectedItem,
    setViewAccountId,
  }
}
