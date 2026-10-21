import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetLlamaManagerActions,
  useGetLlamaManagerData,
} from '../../../hooks/stw-operations/llama-manager'
import { useGetAccounts } from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'
import type {
  LlamaManagerInventoryPack,
  LlamaManagerShopOffer,
} from '../../../types/llama-manager'

export function useLlamaManagerPage() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const { accountsArray } = useGetAccounts()
  const { accounts, tags, isLoading, isActing, data, lastResult } =
    useGetLlamaManagerData()
  const {
    updateAccounts,
    updateTags,
    updateLoading,
    updateActing,
    updateData,
    clearData,
    setLastResult,
  } = useGetLlamaManagerActions()

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

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [bulkMiniQty, setBulkMiniQty] = useState(1)
  const [bulkUpgradeQty, setBulkUpgradeQty] = useState(1)
  const [choiceDialog, setChoiceDialog] = useState<{
    pack: LlamaManagerInventoryPack
    accountId: string
  } | null>(null)
  const [manualSelectionIdx, setManualSelectionIdx] = useState(0)

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
    const responseListener = window.electronAPI.llamaManagerResponseData(
      async (payload) => {
        updateData(payload)
      },
    )
    const loadingListener = window.electronAPI.llamaManagerLoadingDone(
      async () => {
        updateLoading(false)
      },
    )
    const resultListener = window.electronAPI.llamaManagerActionResult(
      async (result) => {
        updateActing(false)
        setLastResult(result)

        if (result.success) {
          if (result.purchased) {
            toast(
              t('llama-manager.toasts.purchased', {
                count: result.purchased,
              }),
            )
          } else if (result.opened) {
            toast(
              t('llama-manager.toasts.opened', {
                count: result.opened,
              }),
            )
          } else {
            toast(t('llama-manager.toasts.success'))
          }
        } else {
          const errorKey = `llama-manager.toasts.error_${result.error ?? 'unknown'}`
          const fallback = t('llama-manager.toasts.error', {
            context: result.error ?? 'unknown',
          })
          toast(t(errorKey, { defaultValue: fallback }))
        }
      },
    )
    const bulkListener = window.electronAPI.llamaManagerBulkResult(
      async (result) => {
        updateActing(false)

        if (result.success) {
          const toastKey =
            result.kind === 'upgrade'
              ? 'llama-manager.toasts.bulk-upgrade'
              : 'llama-manager.toasts.bulk-mini'
          toast(
            t(toastKey, {
              count: result.totalPurchased,
              accounts: result.accountsOk,
              failed: result.accountsFailed,
            }),
          )
        } else {
          const errorKey = `llama-manager.toasts.error_${result.error ?? 'unknown'}`
          toast(
            t(errorKey, {
              defaultValue: t('llama-manager.toasts.error', {
                context: result.error ?? 'unknown',
              }),
            }),
          )
        }
      },
    )

    return () => {
      responseListener.removeListener()
      loadingListener.removeListener()
      resultListener.removeListener()
      bulkListener.removeListener()
    }
  }, [t, updateActing, updateData, updateLoading, setLastResult])

  const handleLoad = () => {
    if (isDisabledForm && !isActing) {
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
    setQuantities({})
    window.electronAPI.llamaManagerRequestData(selected)
  }

  const getQuantity = (key: string, fallback = 1) => {
    const value = quantities[key]
    if (value === undefined || Number.isNaN(value) || value < 1) {
      return fallback
    }
    return Math.floor(value)
  }

  const setQuantity = (key: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(1, Math.floor(value || 1)),
    }))
  }

  const handlePurchase = (
    accountId: string,
    offer: LlamaManagerShopOffer,
  ) => {
    if (isActing) return

    const key = `${accountId}:shop:${offer.offerId}`
    const max =
      offer.remaining !== null && offer.remaining >= 0
        ? Math.max(offer.remaining, 1)
        : 9999
    const quantity = Math.min(getQuantity(key, 1), max)

    updateActing(true)
    window.electronAPI.llamaManagerPurchase({
      accountId,
      offerId: offer.offerId,
      quantity,
      currencySubType: offer.currencySubType,
      expectedTotalPrice: offer.price * quantity,
      currencyType: offer.currencyType,
    })
  }

  const handleBulkPurchase = (kind: 'mini' | 'upgrade') => {
    if (isActing) return

    const selected = getAccounts()
    if (selected.length <= 0) {
      toast(t('form.accounts.no-linked', { ns: 'general' }))
      return
    }

    const raw = kind === 'upgrade' ? bulkUpgradeQty : bulkMiniQty
    const quantity = Math.max(1, Math.floor(raw || 1))
    updateActing(true)
    window.electronAPI.llamaManagerBulkPurchase({
      accountIds: selected.map((account) => account.accountId),
      quantity,
      kind,
    })
  }

  const handleBulkPurchaseMini = () => handleBulkPurchase('mini')
  const handleBulkPurchaseUpgrade = () => handleBulkPurchase('upgrade')

  const handleOpenGroup = (
    accountId: string,
    packs: Array<LlamaManagerInventoryPack>,
    quantity?: number,
  ) => {
    if (isActing || packs.length <= 0) return

    const regular = packs.filter((pack) => !pack.isChoicePack)
    if (regular.length <= 0) {
      toast(t('llama-manager.toasts.choice-only'))
      return
    }

    const limit = quantity ?? regular.length
    const itemIds = regular.slice(0, limit).map((pack) => pack.itemId)

    updateActing(true)
    window.electronAPI.llamaManagerOpenPacks({
      accountId,
      itemIds,
    })
  }

  const handleOpenAll = (accountId: string) => {
    const accountData = data[accountId]
    if (!accountData) return

    const regular = accountData.inventory.filter(
      (pack) => !pack.isChoicePack,
    )
    handleOpenGroup(accountId, regular)
  }

  const handleOpenTemplate = (
    accountId: string,
    templateId: string,
    quantity: number,
  ) => {
    const accountData = data[accountId]
    if (!accountData) return

    const packs = accountData.inventory.filter(
      (pack) =>
        pack.templateId === templateId && !pack.isChoicePack,
    )
    handleOpenGroup(accountId, packs, quantity)
  }

  const openChoiceDialog = (
    accountId: string,
    pack: LlamaManagerInventoryPack,
  ) => {
    setManualSelectionIdx(0)
    setChoiceDialog({ accountId, pack })
  }

  const closeChoiceDialog = () => {
    setChoiceDialog(null)
  }

  const confirmChoiceOpen = () => {
    if (!choiceDialog || isActing) return

    updateActing(true)
    window.electronAPI.llamaManagerOpenChoice({
      accountId: choiceDialog.accountId,
      cardPackItemId: choiceDialog.pack.itemId,
      cardPackItemIds: [choiceDialog.pack.itemId],
      selectionIdx: manualSelectionIdx,
    })
    setChoiceDialog(null)
  }

  const handleOpenChoiceDefault = (
    accountId: string,
    pack: LlamaManagerInventoryPack,
    selectionIdx = 0,
  ) => {
    if (isActing) return

    updateActing(true)
    window.electronAPI.llamaManagerOpenChoice({
      accountId,
      cardPackItemId: pack.itemId,
      cardPackItemIds: [pack.itemId],
      selectionIdx,
    })
  }

  /** Open all choice packs with the same selection index (default 0). */
  const handleOpenAllChoice = (
    accountId: string,
    packs?: Array<LlamaManagerInventoryPack>,
    selectionIdx = 0,
  ) => {
    if (isActing) return

    const accountData = data[accountId]
    if (!accountData) return

    const choicePacks =
      packs ??
      accountData.inventory.filter((pack) => pack.isChoicePack)

    if (choicePacks.length <= 0) {
      toast(t('llama-manager.toasts.choice-empty'))
      return
    }

    updateActing(true)
    window.electronAPI.llamaManagerOpenChoice({
      accountId,
      cardPackItemIds: choicePacks.map((pack) => pack.itemId),
      selectionIdx,
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
    quantities,
    bulkMiniQty,
    bulkUpgradeQty,
    choiceDialog,
    manualSelectionIdx,

    updateAccounts,
    updateTags,
    setQuantity,
    getQuantity,
    setBulkMiniQty,
    setBulkUpgradeQty,
    setManualSelectionIdx,
    handleLoad,
    handlePurchase,
    handleBulkPurchaseMini,
    handleBulkPurchaseUpgrade,
    handleOpenAll,
    handleOpenTemplate,
    handleOpenGroup,
    openChoiceDialog,
    closeChoiceDialog,
    confirmChoiceOpen,
    handleOpenChoiceDefault,
    handleOpenAllChoice,
  }
}

/** Group inventory packs by templateId for display */
export function groupInventory(
  inventory: Array<LlamaManagerInventoryPack>,
) {
  const groups = new Map<
    string,
    {
      templateId: string
      name: string
      isChoicePack: boolean
      packs: Array<LlamaManagerInventoryPack>
      total: number
    }
  >()

  inventory.forEach((pack) => {
    const existing = groups.get(pack.templateId)
    if (existing) {
      existing.packs.push(pack)
      existing.total += pack.quantity
    } else {
      groups.set(pack.templateId, {
        templateId: pack.templateId,
        name: pack.name,
        isChoicePack: pack.isChoicePack,
        packs: [pack],
        total: pack.quantity,
      })
    }
  })

  return Array.from(groups.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}
