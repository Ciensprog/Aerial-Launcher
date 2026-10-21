import axios from 'axios'

import { fortniteApiService } from '../config/fortnite-api'

export const ITEM_SHOP_SNAPSHOT_URL =
  'https://raw.githubusercontent.com/Fortnite-Datamining/Fortnite-Datamining/main/data/shop/current.json'

export const ITEM_SHOP_SEARCH_LANGUAGES = [
  'pl',
  'de',
  'es',
  'es-419',
  'fr',
  'it',
  'pt-BR',
  'ru',
  'ja',
  'ko',
  'tr',
  'ar',
  'zh-Hans',
] as const

export type FortniteApiShopItem = {
  id?: string
  name?: string
  title?: string
  artist?: string
  description?: string
  type?: {
    value?: string
    displayValue?: string
  }
  rarity?: {
    value?: string
    displayValue?: string
  }
  images?: {
    smallIcon?: string
    icon?: string
    featured?: string
  }
  albumArt?: string
}

export type FortniteApiShopEntry = {
  regularPrice?: number
  finalPrice?: number
  offerId?: string
  devName?: string
  giftable?: boolean
  inDate?: string
  outDate?: string
  offerDates?: {
    in?: string
    out?: string
  }
  layoutId?: string
  layout?: {
    id?: string
    name?: string
    category?: string
  }
  newDisplayAsset?: {
    renderImages?: Array<{
      image?: string
    }>
  }
  items?: Array<FortniteApiShopItem>
  brItems?: Array<FortniteApiShopItem>
  tracks?: Array<FortniteApiShopItem>
  instruments?: Array<FortniteApiShopItem>
  cars?: Array<FortniteApiShopItem>
  legoKits?: Array<FortniteApiShopItem>
}

export type FortniteApiShopResponse = {
  status?: number
  data?: {
    date?: string
    entries?: Array<FortniteApiShopEntry>
  }
}

export function fetchPublicItemShop(language?: string) {
  return fortniteApiService.get<FortniteApiShopResponse>('/v2/shop', {
    params: language ? { language } : undefined,
  })
}

function shopEntryCount(response: { data?: FortniteApiShopResponse }) {
  return response.data?.data?.entries?.length ?? 0
}

export async function fetchPublicItemShopWithFallback() {
  try {
    const response = await fetchPublicItemShop()

    if (shopEntryCount(response) > 0) {
      return response
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // fortnite-api.com /v2/shop 503s while cosmetics rebuild after a game update
  }

  const snapshot = await axios.get<FortniteApiShopResponse>(
    ITEM_SHOP_SNAPSHOT_URL,
    {
      timeout: 20000,
      headers: {
        'User-Agent': 'AerialLauncher-ItemShop/1.0',
      },
    }
  )

  if (shopEntryCount(snapshot) === 0) {
    throw new Error('item shop snapshot empty')
  }

  return snapshot
}
