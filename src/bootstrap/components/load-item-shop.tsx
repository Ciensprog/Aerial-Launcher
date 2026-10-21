import { useEffect } from 'react'

import { useItemShopStore } from '../../state/stw-operations/item-shop'

export function LoadItemShop() {
  const setGifts = useItemShopStore((state) => state.setGifts)

  useEffect(() => {
    const giftsListener = window.electronAPI.itemShopGiftHistoryResponse(
      async (gifts) => {
        setGifts(gifts)
      }
    )

    window.electronAPI.itemShopRequestGiftHistory()

    return () => {
      giftsListener.removeListener()
    }
  }, [setGifts])

  return null
}
