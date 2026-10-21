import type { ChangeEventHandler, FormEventHandler } from 'react'
import type { SelectOption } from '../../../components/ui/third-party/extended/input-tags'
import type { ItemShopOffer } from '../../../types/item-shop'
import type { PartyPlayerLookupResponse } from '../../../types/party'

import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'
import { useItemShopStore } from '../../../state/stw-operations/item-shop'

import { toast } from '../../../lib/notifications'

export function useItemShopPage() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const accounts = useItemShopStore((state) => state.accounts)
  const tags = useItemShopStore((state) => state.tags)
  const catalog = useItemShopStore((state) => state.catalog)
  const accountInfo = useItemShopStore((state) => state.accountInfo)
  const isLoadingCatalog = useItemShopStore((state) => state.isLoadingCatalog)
  const isActing = useItemShopStore((state) => state.isActing)
  const storeUpdateAccounts = useItemShopStore((state) => state.updateAccounts)
  const storeUpdateTags = useItemShopStore((state) => state.updateTags)
  const setCatalog = useItemShopStore((state) => state.setCatalog)
  const setAccountInfo = useItemShopStore((state) => state.setAccountInfo)
  const setLoadingCatalog = useItemShopStore(
    (state) => state.setLoadingCatalog
  )
  const setLoadingAccounts = useItemShopStore(
    (state) => state.setLoadingAccounts
  )
  const setActing = useItemShopStore((state) => state.setActing)

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

  const [search, setSearch] = useState('')
  const [section, setSection] = useState('all')
  const [creatorCode, setCreatorCode] = useState('')
  const [buyOffer, setBuyOffer] = useState<ItemShopOffer | null>(null)
  const [giftOffer, setGiftOffer] = useState<ItemShopOffer | null>(null)
  const [giftSearch, setGiftSearch] = useState('')
  const [giftLookup, setGiftLookup] =
    useState<PartyPlayerLookupResponse | null>(null)
  const [isSearchingGift, setIsSearchingGift] = useState(false)

  const selectedAccountData = getAccounts()
  const isBusy = isActing
  const isDisabledForm = isSelectedEmpty || !areThereAccounts

  const offers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return catalog.offers.filter((offer) => {
      if (section !== 'all' && offer.section !== section) {
        return false
      }

      if (query === '') {
        return true
      }

      const numericQuery = Number(query.replace(/[,\s]/g, ''))
      const isPriceQuery =
        query !== '' &&
        Number.isFinite(numericQuery) &&
        /^\d+([.,]\d+)?$/.test(query.replace(/\s/g, ''))

      if (
        isPriceQuery &&
        (offer.price === numericQuery || offer.regularPrice === numericQuery)
      ) {
        return true
      }

      const fields = [
        offer.title,
        offer.type,
        offer.section,
        ...(offer.searchNames ?? []),
      ]

      return fields.some((value) => value.toLowerCase().includes(query))
    })
  }, [catalog.offers, search, section])

  useEffect(() => {
    const catalogListener = window.electronAPI.itemShopCatalogResponse(
      async (payload) => {
        setCatalog(payload)
      }
    )
    const giftsListener = window.electronAPI.itemShopGiftHistoryResponse(
      async (gifts) => {
        useItemShopStore.getState().setGifts(gifts)
      }
    )
    const accountListener = window.electronAPI.itemShopAccountResponse(
      async (info) => {
        setAccountInfo(info)
      }
    )
    const accountsDone = window.electronAPI.itemShopAccountsDone(
      async () => {
        setLoadingAccounts(false)
      }
    )
    const creatorListener = window.electronAPI.itemShopCreatorCodeResult(
      async (results) => {
        setActing(false)
        const ok = results.filter((item) => item.success).length

        if (ok > 0) {
          toast(
            t('item-shop.creator.success', {
              count: ok,
            })
          )
        } else {
          const firstError = results.find((item) => !item.success)
          toast(
            t('item-shop.creator.error-detail', {
              error:
                firstError?.errorMessage ??
                firstError?.error ??
                'unknown',
            })
          )
        }

        if (selectedAccountData.length > 0) {
          setLoadingAccounts(true)
          window.electronAPI.itemShopRequestAccounts(selectedAccountData)
        }
      }
    )
    const purchaseListener = window.electronAPI.itemShopPurchaseResult(
      async (payload) => {
        setActing(false)
        const ok = payload.results.filter((item) => item.success).length

        if (payload.gifts.length > 0) {
          useItemShopStore.getState().prependGifts(payload.gifts)
        }

        toast(
          t(
            ok > 0
              ? 'item-shop.purchase-success'
              : 'item-shop.purchase-error',
            { count: ok }
          )
        )
        setBuyOffer(null)

        if (selectedAccountData.length > 0) {
          setLoadingAccounts(true)
          window.electronAPI.itemShopRequestAccounts(selectedAccountData)
        }
      }
    )
    const giftListener = window.electronAPI.itemShopGiftResult(
      async (payload) => {
        setActing(false)
        const ok = payload.results.filter((item) => item.success).length

        if (payload.gifts.length > 0) {
          useItemShopStore.getState().prependGifts(payload.gifts)
          payload.gifts.forEach((gift) => {
            toast(
              t('item-shop.gift-notification', {
                item: gift.title,
                from: gift.fromDisplayName,
                to: gift.toDisplayName,
                price: gift.price,
                code: gift.creatorCode || '-',
              })
            )
          })
        } else {
          toast(
            t(
              ok > 0 ? 'item-shop.gift-success' : 'item-shop.gift-error',
              { count: ok }
            )
          )
        }
        setGiftOffer(null)
        setGiftLookup(null)
        setGiftSearch('')

        if (selectedAccountData.length > 0) {
          setLoadingAccounts(true)
          window.electronAPI.itemShopRequestAccounts(selectedAccountData)
        }
      }
    )
    const lookupListener = window.electronAPI.notificationLookupPartyPlayer(
      async (response) => {
        setIsSearchingGift(false)
        setGiftLookup(response)
      }
    )

    window.electronAPI.itemShopRequestGiftHistory()

    return () => {
      catalogListener.removeListener()
      giftsListener.removeListener()
      accountListener.removeListener()
      accountsDone.removeListener()
      creatorListener.removeListener()
      purchaseListener.removeListener()
      giftListener.removeListener()
      lookupListener.removeListener()
    }
  }, [selectedAccountData, setAccountInfo, setActing, setCatalog, setLoadingAccounts, t])

  const updateAccounts = (value: Array<SelectOption>) => {
    storeUpdateAccounts(value.map((item) => item.value))
  }

  const updateTags = (value: Array<SelectOption>) => {
    storeUpdateTags(value.map((item) => item.value))
  }

  const handleLoad = () => {
    if (isDisabledForm) {
      return
    }

    const selected = getAccounts()

    if (selected.length <= 0) {
      return
    }

    setLoadingCatalog(true)
    setLoadingAccounts(true)
    window.electronAPI.itemShopLoadCache()
    window.electronAPI.itemShopRequestCatalog(selected[0])
    window.electronAPI.itemShopRequestAccounts(selected)
  }

  const handleApplyCreatorCode = () => {
    if (isDisabledForm || creatorCode.trim() === '') {
      return
    }

    setActing(true)
    window.electronAPI.itemShopApplyCreatorCode({
      accounts: getAccounts(),
      code: creatorCode,
    })
  }

  const handleBuy = () => {
    if (!buyOffer || isDisabledForm) {
      return
    }

    setActing(true)
    window.electronAPI.itemShopPurchase({
      accounts: getAccounts(),
      offerId: buyOffer.offerId,
      offerTitle: buyOffer.title,
      imageUrl: buyOffer.imageUrl,
      expectedTotalPrice: buyOffer.price,
      currencyType: buyOffer.currencyType,
      currencySubType: buyOffer.currencySubType,
    })
  }

  const handleSearchGift: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    const selected = getAccounts()

    if (giftSearch.trim() === '' || selected.length <= 0) {
      return
    }

    setIsSearchingGift(true)
    setGiftLookup(null)
    window.electronAPI.lookupPartyPlayer(selected, giftSearch)
  }

  const handleChangeGiftSearch: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setGiftSearch(event.target.value)
  }

  const handleGift = () => {
    if (!giftOffer || !giftLookup?.success || isDisabledForm) {
      return
    }

    setActing(true)
    window.electronAPI.itemShopGift({
      accounts: getAccounts(),
      offerId: giftOffer.offerId,
      offerTitle: giftOffer.title,
      imageUrl: giftOffer.imageUrl,
      iconFile: giftOffer.iconFile,
      expectedTotalPrice: giftOffer.price,
      currencyType: giftOffer.currencyType,
      currencySubType: giftOffer.currencySubType,
      receiverAccountId: giftLookup.data.lookup.id,
      receiverDisplayName: giftLookup.data.lookup.displayName,
    })
  }

  return {
    accountInfo,
    accountOptions,
    areThereAccounts,
    buyOffer,
    catalog,
    creatorCode,
    giftLookup,
    giftOffer,
    giftSearch,
    isActing,
    isBusy,
    isDisabledForm,
    isLoadingCatalog,
    isSearchingGift,
    offers,
    parsedSelectedAccounts,
    parsedSelectedTags,
    search,
    section,
    selectedAccountData,
    tagOptions,

    handleApplyCreatorCode,
    handleBuy,
    handleChangeGiftSearch,
    handleGift,
    handleLoad,
    handleSearchGift,
    setBuyOffer,
    setCreatorCode,
    setGiftOffer,
    setSearch,
    setSection,
    updateAccounts,
    updateTags,
  }
}
