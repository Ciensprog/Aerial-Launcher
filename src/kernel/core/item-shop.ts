import type { AccountData } from '../../types/accounts'
import type {
  ItemShopAccountInfo,
  ItemShopActionResult,
  ItemShopCatalogResponse,
  ItemShopCreatorCodeRequest,
  ItemShopGiftHistoryEntry,
  ItemShopGiftRequest,
  ItemShopGiftResultPayload,
  ItemShopOffer,
  ItemShopPurchaseRequest,
} from '../../types/item-shop'

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
import { DataDirectory } from '../startup/data-directory'
import { Authentication } from './authentication'

import { lookupAffiliateSlug } from '../../services/endpoints/affiliate'
import {
  fetchPublicItemShop,
  fetchPublicItemShopWithFallback,
  ITEM_SHOP_SEARCH_LANGUAGES,
  type FortniteApiShopEntry,
  type FortniteApiShopItem,
} from '../../services/endpoints/fortnite-api'
import {
  giftCatalogEntry,
  getQueryProfileMainProfile,
  purchaseCatalogEntry,
  setAffiliateName,
} from '../../services/endpoints/mcp'
import { storeRequestAccess } from '../../services/endpoints/store'
import { getCatalog } from '../../services/endpoints/storefront'

import { getDate, getDateWithDefaultFormat } from '../../lib/dates'
import { parseCustomDisplayName } from '../../lib/utils'

const SKIP_STOREFRONTS = new Set([
  'CardPackStorePreroll',
  'CardPackStoreGameplay',
  'FoundersPack',
  'CurrencyStorefront',
  'STWRotationalEventStorefront',
  'STWSpecialEventStorefront',
])

const GRANT_TYPE_LABELS: Record<string, string> = {
  athenacharacter: 'Outfit',
  athenabackpack: 'Back Bling',
  athenapickaxe: 'Pickaxe',
  athenaglider: 'Glider',
  athenadance: 'Emote',
  athenaitemwrap: 'Wrap',
  athenamusicpack: 'Music',
  athenaloadingscreen: 'Loading Screen',
  athenaskydivecontrail: 'Contrail',
  athenashoes: 'Kicks',
  sparkssong: 'Jam Track',
  sparksguitar: 'Guitar',
  sparksbass: 'Bass',
  sparksdrum: 'Drums',
  sparkskeyboard: 'Keytar',
  sparksmicrophone: 'Microphone',
}

type RawPrice = {
  currencyType?: string
  currencySubType?: string
  regularPrice?: number
  finalPrice?: number
}

type RawGrant = {
  templateId?: string
  quantity?: number
}

type RawEntry = {
  offerId?: string
  devName?: string
  title?: string
  displayAssetPath?: string
  giftable?: boolean
  refundable?: boolean
  categories?: Array<string>
  prices?: Array<RawPrice>
  itemGrants?: Array<RawGrant>
  meta?: Record<string, unknown>
  metaInfo?: Array<{ key?: string; value?: string }>
}

function publicEntryOutDate(entry: FortniteApiShopEntry) {
  return entry.outDate || entry.offerDates?.out || null
}

function publicEntryInDate(entry: FortniteApiShopEntry) {
  return entry.inDate || entry.offerDates?.in || null
}

type RawStorefront = {
  name?: string
  catalogEntries?: Array<RawEntry>
}

type CachedCatalog = {
  shopDate: string | null
  expiration: string | null
  fetchedAt: string | null
  offers: Array<ItemShopOffer>
  sections: Array<string>
}

function emptyCatalog(): ItemShopCatalogResponse {
  return {
    shopDate: null,
    expiration: null,
    fetchedAt: null,
    newShopAvailable: false,
    offers: [],
    sections: [],
  }
}

function catalogPath() {
  return path.join(DataDirectory.rootPath, 'item-shop-catalog.json')
}

function giftsPath() {
  return path.join(DataDirectory.rootPath, 'item-shop-gifts.json')
}

function isNewShopAvailable(expiration: string | null) {
  if (!expiration) {
    return false
  }

  const expires = Date.parse(expiration)

  return Number.isFinite(expires) && Date.now() > expires
}

function epicError(error: unknown) {
  const response = (
    error as { response?: { data?: Record<string, string> } }
  )?.response?.data

  return (
    response?.errorMessage ??
    response?.errorCode?.split('.')?.at(-1) ??
    'unknown'
  )
}

async function readCachedCatalog(): Promise<CachedCatalog | null> {
  try {
    const raw = await readFile(catalogPath(), { encoding: 'utf8' })
    const parsed = JSON.parse(raw) as CachedCatalog

    if (!parsed || !Array.isArray(parsed.offers)) {
      return null
    }

    return parsed
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null
  }
}

async function writeCachedCatalog(data: CachedCatalog) {
  await writeFile(catalogPath(), JSON.stringify(data, null, 2), {
    encoding: 'utf8',
  })
}

async function readGiftHistory(): Promise<Array<ItemShopGiftHistoryEntry>> {
  try {
    const raw = await readFile(giftsPath(), { encoding: 'utf8' })
    const parsed = JSON.parse(raw) as Array<ItemShopGiftHistoryEntry>

    return Array.isArray(parsed) ? parsed : []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return []
  }
}

async function writeGiftHistory(data: Array<ItemShopGiftHistoryEntry>) {
  await writeFile(giftsPath(), JSON.stringify(data, null, 2), {
    encoding: 'utf8',
  })
}

function firstPublicItem(entry: FortniteApiShopEntry) {
  return (
    entry.brItems?.[0] ??
    entry.items?.[0] ??
    entry.tracks?.[0] ??
    entry.instruments?.[0] ??
    entry.cars?.[0] ??
    entry.legoKits?.[0] ??
    null
  )
}

function itemDisplayName(item: FortniteApiShopItem | null) {
  return item?.name?.trim() || item?.title?.trim() || ''
}

function uniqueSearchNames(values: Array<string | null | undefined>) {
  const seen = new Set<string>()
  const names: Array<string> = []

  values.forEach((value) => {
    const name = value?.trim()

    if (!name) {
      return
    }

    const key = name.toLowerCase()

    if (seen.has(key)) {
      return
    }

    seen.add(key)
    names.push(name)
  })

  return names
}

function entryItemLists(entry: FortniteApiShopEntry) {
  return [
    entry.brItems,
    entry.items,
    entry.tracks,
    entry.instruments,
    entry.cars,
    entry.legoKits,
  ]
}

function collectEntrySearchNames(entry: FortniteApiShopEntry) {
  const names: Array<string> = []

  entryItemLists(entry).forEach((items) => {
    items?.forEach((item) => {
      names.push(itemDisplayName(item), item.artist ?? '')
    })
  })

  return uniqueSearchNames(names)
}

function entrySearchKeys(entry: FortniteApiShopEntry) {
  const keys: Array<string> = []
  const first = firstPublicItem(entry)

  if (entry.offerId) {
    keys.push(entry.offerId)
  }

  if (first?.id) {
    keys.push(first.id)
  }

  entryItemLists(entry).forEach((items) => {
    items?.forEach((item) => {
      if (item.id) {
        keys.push(item.id)
      }
    })
  })

  return keys
}

async function fetchShopSearchNames() {
  const namesByKey = new Map<string, Set<string>>()

  const addNames = (keys: Array<string>, names: Array<string>) => {
    keys.forEach((key) => {
      let bucket = namesByKey.get(key)

      if (!bucket) {
        bucket = new Set<string>()
        namesByKey.set(key, bucket)
      }

      names.forEach((name) => bucket?.add(name))
    })
  }

  const languages = [...ITEM_SHOP_SEARCH_LANGUAGES]
  const workers = Math.min(2, languages.length)

  await Promise.all(
    Array.from({ length: workers }, async () => {
      while (languages.length > 0) {
        const language = languages.shift()

        if (!language) {
          return
        }

        try {
          const response = await fetchPublicItemShop(language)
          const entries = response.data.data?.entries ?? []

          entries.forEach((entry) => {
            addNames(entrySearchKeys(entry), collectEntrySearchNames(entry))
          })
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          //
        }
      }
    })
  )

  return namesByKey
}

function withSearchNames(
  offers: Array<ItemShopOffer>,
  namesByKey: Map<string, Set<string>>
) {
  return offers.map((offer) => {
    const extra: Array<string> = []

    const take = (key?: string) => {
      if (!key) {
        return
      }

      namesByKey.get(key)?.forEach((name) => extra.push(name))
    }

    take(offer.offerId)
    offer.grants.forEach((grant) => take(grant.templateId))

    return {
      ...offer,
      searchNames: uniqueSearchNames([
        ...(offer.searchNames ?? []),
        ...extra,
      ]),
    }
  })
}

function entryIconUrl(entry: FortniteApiShopEntry) {
  const first = firstPublicItem(entry)
  const image =
    first?.images?.icon ??
    first?.images?.smallIcon ??
    first?.albumArt ??
    entry.newDisplayAsset?.renderImages?.[0]?.image ??
    null

  if (image && image.startsWith('https://')) {
    return image
  }

  return null
}

function offersFromPublicShop(
  publicEntries: Array<FortniteApiShopEntry>
): Array<ItemShopOffer> {
  const offers: Array<ItemShopOffer> = []

  publicEntries.forEach((entry) => {
    const first = firstPublicItem(entry)
    const title = itemDisplayName(first)

    if (!title) {
      return
    }

    offers.push({
      offerId: entry.offerId ?? first?.id ?? title,
      title,
      description: first?.description ?? '',
      section: entry.layout?.name ?? entry.layoutId ?? 'Shop',
      storefront: 'BRShop',
      type: first?.type?.displayValue ?? first?.type?.value ?? 'Item',
      rarity: first?.rarity?.value ?? first?.rarity?.displayValue ?? 'common',
      imageUrl: entryIconUrl(entry),
      searchNames: collectEntrySearchNames(entry),
      price: entry.finalPrice ?? 0,
      regularPrice: entry.regularPrice ?? entry.finalPrice ?? 0,
      currencyType: 'MtxCurrency',
      currencySubType: '',
      giftable: entry.giftable ?? false,
      inDate: publicEntryInDate(entry),
      outDate: publicEntryOutDate(entry),
      grants: first?.id ? [{ templateId: first.id, quantity: 1 }] : [],
    })
  })

  const unique = new Map<string, ItemShopOffer>()
  offers.forEach((offer) => {
    if (!unique.has(offer.offerId)) {
      unique.set(offer.offerId, offer)
    }
  })

  return sortOffers(Array.from(unique.values()))
}

function sortOffers(offers: Array<ItemShopOffer>) {
  return [...offers].sort((a, b) => {
    if (a.section !== b.section) {
      return a.section.localeCompare(b.section)
    }

    return a.title.localeCompare(b.title)
  })
}

function catalogSections(offers: Array<ItemShopOffer>) {
  return [...new Set(offers.map((offer) => offer.section))].sort((a, b) =>
    a.localeCompare(b)
  )
}

function isCosmeticGrant(templateId: string) {
  const prefix = (templateId.split(':')[0] ?? '').toLowerCase()

  return !['currency', 'accountresource', 'cardpack', 'token'].includes(prefix)
}

function grantDisplayType(templateId: string) {
  const prefix = (templateId.split(':')[0] ?? '').toLowerCase()

  if (GRANT_TYPE_LABELS[prefix]) {
    return GRANT_TYPE_LABELS[prefix]
  }

  if (prefix.startsWith('vehiclecosmetics')) {
    return 'Car'
  }

  if (prefix.startsWith('juno') || prefix.startsWith('lego')) {
    return 'Lego'
  }

  return 'Item'
}

function grantCosmeticId(templateId: string) {
  return (templateId.split(':')[1] ?? templateId).trim()
}

function grantIconUrl(templateId: string) {
  const id = grantCosmeticId(templateId).toLowerCase()

  if (!id) {
    return null
  }

  return `https://fortnite-api.com/images/cosmetics/br/${encodeURIComponent(id)}/icon.png`
}

function humanizeGrantId(templateId: string) {
  const id = grantCosmeticId(templateId)
    .replace(
      /^(character|cid|bid|pickaxe|glider|eid|wrap|musicpack|sid|spid)_/i,
      ''
    )
    .replace(/_/g, ' ')

  return id
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function parseEpicDevName(devName?: string) {
  if (!devName) {
    return ''
  }

  const virtual = devName.match(
    /^\s*(?:\[VIRTUAL\])?\s*\d+\s*x\s*(.+?)\s+for\s+\d+/i
  )
  const raw = (virtual?.[1] ?? devName).trim()
  const withId = raw.match(/^(.+?)\s*\(([^)]+)\)\s*$/)

  if (withId) {
    const name = withId[1].trim()

    if (name && name.toUpperCase() !== 'TBD') {
      return name
    }

    return withId[2].trim()
  }

  return raw
}

function looksLikeLocKey(value: string) {
  return value.includes('.') && !value.includes(' ')
}

function metaString(entry: RawEntry, key: string) {
  const fromMeta = entry.meta?.[key]

  if (typeof fromMeta === 'string' && fromMeta.trim()) {
    return fromMeta.trim()
  }

  const info = entry.metaInfo?.find(
    (item) => item.key?.toLowerCase() === key.toLowerCase()
  )

  return info?.value?.trim() || ''
}

function epicEntrySection(storefront: RawStorefront, entry: RawEntry) {
  return (
    metaString(entry, 'sectionDisplayName') ||
    metaString(entry, 'SectionDisplayName') ||
    metaString(entry, 'sectionId') ||
    metaString(entry, 'SectionId') ||
    entry.categories?.[0] ||
    storefront.name ||
    'Shop'
  )
}

function offerFromEpicEntry(
  storefront: RawStorefront,
  entry: RawEntry,
  mtxPrice: RawPrice
): ItemShopOffer | null {
  if (!entry.offerId) {
    return null
  }

  const grants = (entry.itemGrants ?? [])
    .filter((grant) => typeof grant.templateId === 'string')
    .map((grant) => ({
      templateId: grant.templateId as string,
      quantity: grant.quantity ?? 1,
    }))

  const cosmeticGrant = grants.find((grant) => isCosmeticGrant(grant.templateId))
  const titleSource =
    (entry.title && !looksLikeLocKey(entry.title) ? entry.title : '') ||
    parseEpicDevName(entry.devName) ||
    (cosmeticGrant ? humanizeGrantId(cosmeticGrant.templateId) : '')

  const title = titleSource.trim()

  if (!title || title === entry.offerId) {
    return null
  }

  return {
    offerId: entry.offerId,
    title,
    description: '',
    section: epicEntrySection(storefront, entry),
    storefront: storefront.name ?? 'BRShop',
    type: cosmeticGrant ? grantDisplayType(cosmeticGrant.templateId) : 'Item',
    rarity: 'unknown',
    imageUrl: cosmeticGrant ? grantIconUrl(cosmeticGrant.templateId) : null,
    searchNames: uniqueSearchNames([
      title,
      parseEpicDevName(entry.devName),
      cosmeticGrant ? grantCosmeticId(cosmeticGrant.templateId) : '',
      ...grants.map((grant) => humanizeGrantId(grant.templateId)),
    ]),
    price: mtxPrice.finalPrice ?? 0,
    regularPrice: mtxPrice.regularPrice ?? mtxPrice.finalPrice ?? 0,
    currencyType: 'MtxCurrency',
    currencySubType: mtxPrice.currencySubType ?? '',
    giftable: entry.giftable ?? false,
    inDate: null,
    outDate: null,
    grants,
  }
}

function mergeEpicCatalog(
  offers: Array<ItemShopOffer>,
  storefronts: Array<RawStorefront>
) {
  const byId = new Map(offers.map((offer) => [offer.offerId, offer]))

  storefronts.forEach((storefront) => {
    if (SKIP_STOREFRONTS.has(storefront.name ?? '')) {
      return
    }

    const catalogEntries = storefront.catalogEntries ?? []

    catalogEntries.forEach((entry) => {
      if (!entry.offerId?.startsWith('v2:/')) {
        return
      }

      const mtxPrice = entry.prices?.find(
        (price) => price.currencyType === 'MtxCurrency'
      )

      if (!mtxPrice) {
        return
      }

      const grants = (entry.itemGrants ?? [])
        .filter((grant) => typeof grant.templateId === 'string')
        .map((grant) => ({
          templateId: grant.templateId as string,
          quantity: grant.quantity ?? 1,
        }))

      const existing = byId.get(entry.offerId)

      if (existing) {
        byId.set(entry.offerId, {
          ...existing,
          grants: grants.length > 0 ? grants : existing.grants,
          price: mtxPrice.finalPrice ?? existing.price,
          regularPrice:
            mtxPrice.regularPrice ?? mtxPrice.finalPrice ?? existing.regularPrice,
          currencySubType:
            mtxPrice.currencySubType ?? existing.currencySubType,
          giftable: entry.giftable ?? existing.giftable,
          inDate: existing.inDate ?? null,
          outDate: existing.outDate ?? null,
        })
        return
      }

      const created = offerFromEpicEntry(storefront, entry, mtxPrice)

      if (created) {
        byId.set(entry.offerId, created)
      }
    })
  })

  return sortOffers(Array.from(byId.values()))
}

export class ItemShop {
  static async loadCachedCatalog() {
    const cached = await readCachedCatalog()

    if (!cached) {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.ItemShopCatalogResponse,
        emptyCatalog()
      )
      return
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.ItemShopCatalogResponse,
      {
        shopDate: cached.shopDate,
        expiration: cached.expiration,
        fetchedAt: cached.fetchedAt,
        newShopAvailable: isNewShopAvailable(cached.expiration),
        offers: cached.offers.map((offer) => ({
          ...offer,
          imageUrl:
            offer.imageUrl && offer.imageUrl.startsWith('https://')
              ? offer.imageUrl
              : null,
        })),
        sections: cached.sections,
        fromCache: true,
      }
    )
  }

  static async loadGiftHistory() {
    const gifts = await readGiftHistory()

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.ItemShopGiftHistoryResponse,
      gifts.map((gift) => ({
        ...gift,
        imageUrl:
          gift.imageUrl && !gift.imageUrl.startsWith('data:')
            ? gift.imageUrl
            : null,
      }))
    )
  }

  static async requestCatalog(account: AccountData) {
    const send = async (payload: ItemShopCatalogResponse) => {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.ItemShopCatalogResponse,
        payload
      )

      await writeCachedCatalog({
        shopDate: payload.shopDate,
        expiration: payload.expiration,
        fetchedAt: payload.fetchedAt,
        offers: payload.offers,
        sections: payload.sections,
      })
    }

    const payload: ItemShopCatalogResponse = {
      shopDate: getDate(),
      expiration: null,
      fetchedAt: getDateWithDefaultFormat(),
      newShopAvailable: false,
      offers: [],
      sections: [],
    }

    let applyQueue = Promise.resolve()
    const applyExclusive = (task: () => Promise<void>) => {
      const next = applyQueue.then(task, task)
      applyQueue = next.then(
        () => undefined,
        () => undefined
      )
      return next
    }

    try {
      const publicShop = await fetchPublicItemShopWithFallback()
      const publicData = publicShop.data.data
      const publicEntries = publicData?.entries ?? []

      payload.shopDate = publicData?.date ? getDate(publicData.date) : getDate()
      payload.offers = offersFromPublicShop(publicEntries)
      payload.sections = catalogSections(payload.offers)

      if (payload.offers.length > 0) {
        await send(payload)
      }

      void fetchShopSearchNames()
        .then((namesByKey) =>
          applyExclusive(async () => {
            if (namesByKey.size === 0) {
              return
            }

            payload.offers = withSearchNames(payload.offers, namesByKey)
            payload.sections = catalogSections(payload.offers)
            await send(payload)
          })
        )
        .catch(() => {})
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // fortnite-api / snapshot can lag after a patch; Epic catalog is live
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        if (payload.offers.length === 0) {
          throw new Error('item shop auth')
        }

        return
      }

      const catalog = await getCatalog({ accessToken })
      payload.expiration = catalog.data.expiration ?? null
      payload.newShopAvailable = isNewShopAvailable(payload.expiration)

      const storefronts = (catalog.data.storefronts ??
        []) as Array<RawStorefront>

      await applyExclusive(async () => {
        payload.offers = mergeEpicCatalog(payload.offers, storefronts)
        payload.sections = catalogSections(payload.offers)
        await send(payload)
      })
    } catch {
      if (payload.offers.length > 0) {
        return
      }

      const cached = await readCachedCatalog()

      if (cached && cached.offers.length > 0) {
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.ItemShopCatalogResponse,
          {
            shopDate: cached.shopDate,
            expiration: cached.expiration,
            fetchedAt: cached.fetchedAt,
            newShopAvailable: isNewShopAvailable(cached.expiration),
            offers: cached.offers,
            sections: cached.sections,
            fromCache: true,
          }
        )
        return
      }

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.ItemShopCatalogResponse,
        emptyCatalog()
      )
    }
  }

  static async requestAccounts(accounts: Array<AccountData>) {
    await Promise.allSettled(
      accounts.map(async (account) => {
        const info = await ItemShop.fetchAccountInfo(account)

        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.ItemShopAccountResponse,
          info
        )
      })
    )

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.ItemShopAccountsDone
    )
  }

  static async fetchAccountInfo(
    account: AccountData
  ): Promise<ItemShopAccountInfo> {
    const info: ItemShopAccountInfo = {
      accountId: account.accountId,
      vbucks: 0,
      affiliate: '',
      canSendGifts: true,
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        info.error = 'auth'
        return info
      }

      const profile = await getQueryProfileMainProfile({
        accessToken,
        accountId: account.accountId,
      })
      const change = profile.data.profileChanges?.[0]?.profile
      const items = change?.items ?? {}
      const stats = (change?.stats?.attributes ?? {}) as Record<string, unknown>

      Object.values(items).forEach((item) => {
        if (item.templateId.startsWith('Currency:Mtx')) {
          info.vbucks += item.quantity ?? 0
        }
      })

      if (typeof stats.mtx_affiliate === 'string') {
        info.affiliate = stats.mtx_affiliate
      }

      if (typeof stats.allowed_to_send_gifts === 'boolean') {
        info.canSendGifts = stats.allowed_to_send_gifts
      }

      return info
    } catch {
      info.error = 'fetch'
      return info
    }
  }

  static async applyCreatorCode(request: ItemShopCreatorCodeRequest) {
    const results: Array<ItemShopActionResult> = []
    const slug = request.code.trim()

    if (slug === '') {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.ItemShopCreatorCodeResult,
        results
      )
      return
    }

    await Promise.allSettled(
      request.accounts.map(async (account) => {
        const result: ItemShopActionResult = {
          accountId: account.accountId,
          success: false,
        }

        try {
          const accessToken = await Authentication.verifyAccessToken(account)

          if (!accessToken) {
            result.error = 'auth'
            result.errorMessage = 'invalid_access_token'
            results.push(result)
            return
          }

          try {
            await lookupAffiliateSlug({ slug })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            // Lookup is optional — Fortnite still accepts many codes here.
          }

          const response = await setAffiliateName({
            accessToken,
            accountId: account.accountId,
            affiliateName: slug,
          })

          const stats = (response.data.profileChanges?.[0]?.profile?.stats
            ?.attributes ?? {}) as Record<string, unknown>
          const applied =
            typeof stats.mtx_affiliate === 'string'
              ? stats.mtx_affiliate
              : ''

          if (
            applied !== '' &&
            applied.toLowerCase() !== slug.toLowerCase()
          ) {
            result.error = 'mismatch'
            result.errorMessage = applied
            results.push(result)
            return
          }

          result.success = true
          results.push(result)
        } catch (error) {
          result.error = 'apply'
          result.errorMessage = epicError(error)
          results.push(result)
        }
      })
    )

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.ItemShopCreatorCodeResult,
      results
    )
  }

  static async purchase(request: ItemShopPurchaseRequest) {
    const results: Array<ItemShopActionResult> = []
    const gifts: Array<ItemShopGiftHistoryEntry> = []

    await Promise.allSettled(
      request.accounts.map(async (account) => {
        const result: ItemShopActionResult = {
          accountId: account.accountId,
          success: false,
        }

        try {
          const accessToken = await Authentication.verifyAccessToken(account)

          if (!accessToken) {
            result.error = 'auth'
            result.errorMessage = 'invalid_access_token'
            results.push(result)
            return
          }

          try {
            await storeRequestAccess({
              accessToken,
              accountId: account.accountId,
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            //
          }

          const info = await ItemShop.fetchAccountInfo(account)

          await purchaseCatalogEntry({
            accessToken,
            accountId: account.accountId,
            offerId: request.offerId,
            currency: request.currencyType,
            currencySubType: request.currencySubType,
            expectedTotalPrice: request.expectedTotalPrice,
            purchaseQuantity: 1,
            gameContext: '',
          })

          result.success = true
          results.push(result)

          const displayName = parseCustomDisplayName(account)

          gifts.push({
            id: crypto.randomUUID(),
            kind: 'purchase',
            createdAt: getDateWithDefaultFormat(),
            fromAccountId: account.accountId,
            fromDisplayName: displayName,
            toAccountId: account.accountId,
            toDisplayName: displayName,
            offerId: request.offerId,
            title: request.offerTitle,
            imageUrl:
              request.imageUrl?.startsWith('https://')
                ? request.imageUrl
                : null,
            price: request.expectedTotalPrice,
            creatorCode: info.affiliate,
          })
        } catch (error) {
          result.error = 'purchase'
          result.errorMessage = epicError(error)
          results.push(result)
        }
      })
    )

    if (gifts.length > 0) {
      const history = await readGiftHistory()
      await writeGiftHistory([...gifts, ...history].slice(0, 500))
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.ItemShopPurchaseResult,
      {
        results,
        gifts,
      }
    )
  }

  static async gift(request: ItemShopGiftRequest) {
    const results: Array<ItemShopActionResult> = []
    const gifts: Array<ItemShopGiftHistoryEntry> = []

    await Promise.allSettled(
      request.accounts.map(async (account) => {
        const result: ItemShopActionResult = {
          accountId: account.accountId,
          success: false,
        }

        try {
          const accessToken = await Authentication.verifyAccessToken(account)

          if (!accessToken) {
            result.error = 'auth'
            result.errorMessage = 'invalid_access_token'
            results.push(result)
            return
          }

          const info = await ItemShop.fetchAccountInfo(account)

          await giftCatalogEntry({
            accessToken,
            accountId: account.accountId,
            offerId: request.offerId,
            receiverAccountIds: [request.receiverAccountId],
            expectedTotalPrice: request.expectedTotalPrice,
            currency: request.currencyType,
            currencySubType: request.currencySubType,
            purchaseQuantity: 1,
            personalMessage: request.personalMessage ?? '',
          })

          result.success = true
          results.push(result)

          gifts.push({
            id: crypto.randomUUID(),
            kind: 'gift',
            createdAt: getDateWithDefaultFormat(),
            fromAccountId: account.accountId,
            fromDisplayName: parseCustomDisplayName(account),
            toAccountId: request.receiverAccountId,
            toDisplayName: request.receiverDisplayName,
            offerId: request.offerId,
            title: request.offerTitle,
            imageUrl: request.imageUrl?.startsWith('https://')
              ? request.imageUrl
              : null,
            iconFile: request.iconFile ?? null,
            price: request.expectedTotalPrice,
            creatorCode: info.affiliate,
          })
        } catch (error) {
          result.error = 'gift'
          result.errorMessage = epicError(error)
          results.push(result)
        }
      })
    )

    if (gifts.length > 0) {
      const history = await readGiftHistory()
      await writeGiftHistory([...gifts, ...history].slice(0, 500))
    }

    const payload: ItemShopGiftResultPayload = {
      results,
      gifts,
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.ItemShopGiftResult,
      payload
    )
  }
}
