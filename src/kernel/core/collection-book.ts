import type { AccountData } from '../../types/accounts'
import type {
  CollectionBookAccountData,
  CollectionBookActionResult,
  CollectionBookCostKind,
  CollectionBookItem,
  CollectionBookResources,
  CollectionBookSection,
  CollectionBookSectionId,
  CollectionBookSlotRequest,
  CollectionBookUpgradeRequest,
} from '../../types/collection-book'

import {
  evolutionCap,
  levelCeiling,
  parseStarTier,
  rarityFromTemplate,
  rarityMaxStar,
  sectionForTemplate,
  sectionIdsFor,
} from '../../config/constants/collection-book'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { Authentication } from './authentication'
import { MainWindow } from '../startup/windows/main'
import { AccountsManager } from '../startup/accounts'

import {
  getQueryProfile,
  queryProfile,
  setConvertItem,
  setConvertSlottedItem,
  setSlotItemIntoCollectionBook,
  setUpgradeItem,
  setUpgradeItemBulk,
  setUpgradeSlottedItem,
} from '../../services/endpoints/mcp'

import { parseResource } from '../../lib/parsers/resources'
import { gameItemName, lookupStwItem, resolvedCardKey } from '../../lib/stw/display-names'
import { sleep } from '../../lib/timers'

const UPGRADABLE_PREFIXES = ['Hero:', 'Schematic:', 'Defender:', 'Worker:'] as const

const EMPTY_RESOURCES: CollectionBookResources = {
  peopleXp: 0,
  schematicXp: 0,
  rain: 0,
  lightning: 0,
  eye: 0,
  shard: 0,
  trainingManuals: 0,
  schematicManuals: 0,
  heroSupercharger: 0,
  survivorSupercharger: 0,
  weaponSupercharger: 0,
  trapSupercharger: 0,
}

type ProfileItem = {
  templateId?: string
  quantity?: number
  attributes?: {
    level?: number
    max_level_bonus?: number
    favorite?: boolean
  }
}

type Copy = {
  itemId: string
  templateId: string
  level: number
  maxLevel: number
  favorite: boolean
  profileId: string
  slotted: boolean
}

function emptyAccount(
  accountId: string,
  error?: string,
): CollectionBookAccountData {
  return {
    accountId,
    collectionBookLevel: 0,
    accountLevel: 0,
    accountXp: 0,
    resources: { ...EMPTY_RESOURCES },
    items: [],
    sections: [],
    error,
  }
}

function readItems(response: { data?: unknown } | undefined) {
  const data = response?.data as
    | {
        profileChanges?: Array<{
          profile?: {
            items?: Record<string, ProfileItem>
            stats?: {
              attributes?: {
                level?: number
                xp?: number
                collection_book?: { maxBookXpLevelAchieved?: number }
              }
            }
          }
        }>
      }
    | undefined

  return data?.profileChanges?.[0]?.profile
}

function resourceQty(items: Record<string, ProfileItem>, id: string) {
  let total = 0

  Object.values(items).forEach((item) => {
    const template = (item?.templateId ?? '').toLowerCase()

    if (template === `accountresource:${id}`) {
      total += Number(item.quantity) || 0
    }
  })

  return total
}

function readResources(items: Record<string, ProfileItem>): CollectionBookResources {
  return {
    peopleXp:
      resourceQty(items, 'peoplexp') +
      resourceQty(items, 'heroxp') +
      resourceQty(items, 'personnelxp'),
    schematicXp: resourceQty(items, 'schematicxp'),
    rain: resourceQty(items, 'reagent_c_t01'),
    lightning: resourceQty(items, 'reagent_c_t02'),
    eye: resourceQty(items, 'reagent_c_t03'),
    shard: resourceQty(items, 'reagent_c_t04'),
    trainingManuals: resourceQty(items, 'reagent_people'),
    schematicManuals:
      resourceQty(items, 'reagent_schematic') +
      resourceQty(items, 'reagent_weapons') +
      resourceQty(items, 'reagent_traps'),
    heroSupercharger: resourceQty(items, 'reagent_promotion_heroes'),
    survivorSupercharger: resourceQty(items, 'reagent_promotion_survivors'),
    weaponSupercharger: resourceQty(items, 'reagent_promotion_weapons'),
    trapSupercharger: resourceQty(items, 'reagent_promotion_traps'),
  }
}

function costKindFor(
  templateId: string,
  type: CollectionBookItem['type'],
): CollectionBookCostKind {
  const kind = lookupStwItem(templateId)?.k

  if (kind === 'l') return 'lead'
  if (kind === 's') return 'survivor'
  if (kind === 'd' || type === 'defender') return 'defender'
  if (kind === 'h' || type === 'hero') return 'hero'
  if (kind === 't') return 'trap'

  const id = templateId.toLowerCase()

  if (
    id.includes('trap') ||
    id.includes('ceiling') ||
    id.includes('floor') ||
    id.includes('wall')
  ) {
    return 'trap'
  }

  if (type === 'worker') {
    return id.includes('manager') ? 'lead' : 'survivor'
  }

  return 'weapon'
}

function itemType(templateId: string): CollectionBookItem['type'] {
  if (templateId.startsWith('Hero:')) return 'hero'
  if (templateId.startsWith('Schematic:')) return 'schematic'
  if (templateId.startsWith('Defender:')) return 'defender'
  if (templateId.startsWith('Worker:')) return 'worker'
  return 'other'
}

function pickCopy(copies: Array<Copy>) {
  const pending = copies.filter((copy) => copy.level < copy.maxLevel)
  const pool = pending.length > 0 ? pending : copies

  return [...pool].sort((a, b) => b.level - a.level)[0]
}

function pushCopies(
  groups: Map<string, Array<Copy>>,
  items: Record<string, ProfileItem>,
  profileId: string,
  slotted: boolean,
) {
  Object.entries(items).forEach(([itemId, item]) => {
    const templateId = item?.templateId ?? ''
    const upgradable = UPGRADABLE_PREFIXES.some((prefix) =>
      templateId.startsWith(prefix),
    )

    if (!upgradable || templateId.toLowerCase().includes('ingredient')) {
      return
    }

    const attributes = item.attributes ?? {}
    const cardKey = resolvedCardKey(templateId)
    const copy: Copy = {
      itemId,
      templateId,
      level: attributes.level ?? 1,
      maxLevel: levelCeiling(templateId, attributes.max_level_bonus ?? 0),
      favorite: attributes.favorite === true,
      profileId,
      slotted,
    }
    const list = groups.get(cardKey) ?? []
    list.push(copy)
    groups.set(cardKey, list)
  })
}

function convertedItemId(payload: unknown, previousId: string) {
  if (!payload || typeof payload !== 'object') {
    return previousId
  }

  const body = payload as {
    notifications?: Array<{
      type?: string
      itemsGranted?: Array<{ itemGuid?: string }>
    }>
    profileChanges?: Array<{ changeType?: string; itemId?: string }>
  }

  for (const note of body.notifications ?? []) {
    if (note.type !== 'conversionResult') {
      continue
    }

    for (const granted of note.itemsGranted ?? []) {
      if (granted.itemGuid && granted.itemGuid !== previousId) {
        return granted.itemGuid
      }
    }
  }

  for (const change of body.profileChanges ?? []) {
    if (
      change.changeType === 'itemAdded' &&
      change.itemId &&
      change.itemId !== previousId
    ) {
      return change.itemId
    }
  }

  return previousId
}

function buildSections(
  items: Array<CollectionBookItem>,
): Array<CollectionBookSection> {
  const bySection = new Map<CollectionBookSectionId, Array<CollectionBookItem>>()

  items.forEach((item) => {
    const list = bySection.get(item.sectionId) ?? []
    list.push(item)
    bySection.set(item.sectionId, list)
  })

  return [...bySection.entries()].map(([id, sectionItems]) => ({
    id,
    itemCount: sectionItems.length,
    belowTarget: sectionItems.filter(
      (item) => item.state === 'book' && item.level < item.maxLevel,
    ).length,
    items: sectionItems,
  }))
}

export class CollectionBookManager {
  static async requestBulk(accounts: Array<AccountData>) {
    await Promise.allSettled(
      accounts.map(async (account) => {
        const data = await CollectionBookManager.fetchAccountData(account)
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.CollectionBookResponseData,
          data,
        )
      }),
    )

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.CollectionBookLoadingDone,
    )
  }

  static async fetchAccountData(
    account: AccountData,
  ): Promise<CollectionBookAccountData> {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        return emptyAccount(account.accountId, 'auth')
      }

      const [campaignResult, peopleResult, schematicsResult] =
        await Promise.allSettled([
          getQueryProfile({ accessToken, accountId: account.accountId }),
          queryProfile({
            accessToken,
            accountId: account.accountId,
            profileId: 'collection_book_people0',
          }),
          queryProfile({
            accessToken,
            accountId: account.accountId,
            profileId: 'collection_book_schematics0',
          }),
        ])

      if (campaignResult.status !== 'fulfilled') {
        return emptyAccount(account.accountId, 'fetch')
      }

      const campaign = readItems(campaignResult.value)
      const people =
        peopleResult.status === 'fulfilled' ? readItems(peopleResult.value) : undefined
      const schematics =
        schematicsResult.status === 'fulfilled'
          ? readItems(schematicsResult.value)
          : undefined
      const campaignItems = campaign?.items ?? {}
      const groups = new Map<string, Array<Copy>>()

      pushCopies(groups, campaignItems, 'campaign', false)
      pushCopies(groups, people?.items ?? {}, 'collection_book_people0', true)
      pushCopies(
        groups,
        schematics?.items ?? {},
        'collection_book_schematics0',
        true,
      )

      const items: Array<CollectionBookItem> = []

      groups.forEach((copies, cardKey) => {
        const slotted = copies.filter((copy) => copy.slotted)
        const armory = copies.filter((copy) => !copy.slotted)
        const primary = slotted[0] ?? pickCopy(armory)

        if (!primary) {
          return
        }

        const type = itemType(primary.templateId)
        const parsed = parseResource({
          key: primary.templateId,
          quantity: 1,
        })
        const rarity = rarityFromTemplate(primary.templateId)

        items.push({
          itemId: primary.itemId,
          cardKey,
          templateId: primary.templateId,
          name: gameItemName(primary.templateId) || parsed.name || cardKey,
          type,
          costKind: costKindFor(primary.templateId, type),
          sectionId: sectionForTemplate(primary.templateId),
          level: primary.level,
          maxLevel: primary.maxLevel,
          starTier: parseStarTier(primary.templateId),
          rarity,
          favorite: primary.favorite,
          state: slotted.length > 0 ? 'book' : 'armory',
          profileId: primary.profileId,
          armoryCount: armory.length,
          imageUrl: parsed.imgUrl,
          fallbackUrl: parsed.fallbackUrl,
        })
      })

      items.sort(
        (a, b) => a.name.localeCompare(b.name) || a.rarity.localeCompare(b.rarity),
      )

      const stats = campaign?.stats?.attributes

      return {
        accountId: account.accountId,
        collectionBookLevel: stats?.collection_book?.maxBookXpLevelAchieved ?? 0,
        accountLevel: stats?.level ?? 0,
        accountXp: stats?.xp ?? 0,
        resources: readResources(campaignItems),
        items,
        sections: buildSections(items),
      }
    } catch {
      return emptyAccount(account.accountId, 'fetch')
    }
  }

  static async upgrade(request: CollectionBookUpgradeRequest) {
    const account = AccountsManager.getAccountById(request.accountId)
    const result: CollectionBookActionResult = {
      accountId: request.accountId,
      success: false,
      upgraded: 0,
      skipped: 0,
      failed: 0,
    }

    if (!account) {
      result.error = 'account'
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.CollectionBookActionResult,
        result,
      )
      return
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        result.error = 'auth'
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.CollectionBookActionResult,
          result,
        )
        return
      }

      const snapshot = await CollectionBookManager.fetchAccountData(account)
      const targetLevel = Math.max(
        1,
        Math.min(60, Math.floor(request.targetLevel || 1)),
      )

      let candidates = snapshot.items.filter((item) => item.state !== 'missing')

      if (request.itemIds && request.itemIds.length > 0) {
        const set = new Set(request.itemIds)
        candidates = candidates.filter((item) => set.has(item.itemId))
      } else if (request.sectionId && request.sectionId !== 'all') {
        const ids = sectionIdsFor(request.sectionId)
        const allowed = new Set(ids ?? [])
        candidates = candidates.filter((item) => allowed.has(item.sectionId))
      }

      candidates = candidates.filter(
        (item) =>
          Boolean(item.itemId) &&
          item.level < targetLevel &&
          item.level < item.maxLevel,
      )

      let upgraded = 0
      let skipped = snapshot.items.length - candidates.length
      let failed = 0
      let calls = 0

      const pace = async () => {
        calls += 1

        if (calls % 25 === 0) {
          await sleep(0.15)
        }
      }

      const raise = async (
        itemId: string,
        profileId: string,
        slotted: boolean,
        from: number,
        to: number,
      ) => {
        if (to <= from) {
          return from
        }

        try {
          if (slotted) {
            await setUpgradeSlottedItem({
              accessToken,
              accountId: account.accountId,
              targetItemId: itemId,
              desiredLevel: to,
              profileId,
            })
          } else {
            await setUpgradeItemBulk({
              accessToken,
              accountId: account.accountId,
              targetItemId: itemId,
              desiredLevel: to,
              profileId,
            })
          }

          await pace()

          return to
        } catch {
          // Bulk is rejected on some profiles. Fall back to one level at a time.
        }

        let reached = from

        while (reached < to) {
          try {
            if (slotted) {
              await setUpgradeSlottedItem({
                accessToken,
                accountId: account.accountId,
                targetItemId: itemId,
                desiredLevel: reached + 1,
                profileId,
              })
            } else {
              await setUpgradeItem({
                accessToken,
                accountId: account.accountId,
                targetItemId: itemId,
                profileId,
              })
            }

            reached += 1
            await pace()
          } catch {
            break
          }
        }

        return reached
      }

      const evolve = async (
        itemId: string,
        profileId: string,
        slotted: boolean,
        templateId: string,
      ) => {
        const conversionIndex = templateId.toLowerCase().includes('crystal')
          ? 1
          : 0
        const response = slotted
          ? await setConvertSlottedItem({
              accessToken,
              accountId: account.accountId,
              targetItemId: itemId,
              conversionIndex,
              profileId,
            })
          : await setConvertItem({
              accessToken,
              accountId: account.accountId,
              targetItemId: itemId,
              conversionIndex,
              profileId,
            })

        await pace()

        return convertedItemId(response.data, itemId)
      }

      for (const item of candidates) {
        const profileId = item.profileId || 'campaign'
        const slotted = item.state === 'book'
        const goal = Math.min(targetLevel, item.maxLevel)
        const maxStar = rarityMaxStar(item.templateId)
        const bonus = Math.max(0, item.maxLevel - levelCeiling(item.templateId, 0))
        let level = item.level
        let star = item.starTier || 1
        let itemId = item.itemId
        let guard = 0

        while (level < goal && guard < 12) {
          guard += 1
          const cap = Math.min(goal, evolutionCap(star, maxStar, bonus))

          if (level < cap) {
            const reached = await raise(itemId, profileId, slotted, level, cap)

            if (reached <= level) {
              failed += 1
              break
            }

            upgraded += reached - level
            level = reached
            continue
          }

          if (star >= maxStar) {
            break
          }

          try {
            itemId = await evolve(itemId, profileId, slotted, item.templateId)
            star += 1
          } catch {
            failed += 1
            break
          }
        }
      }

      result.success = upgraded > 0
      result.upgraded = upgraded
      result.skipped = skipped
      result.failed = failed

      if (upgraded <= 0 && failed <= 0) {
        result.error = 'nothing'
      } else if (upgraded <= 0) {
        result.error = 'upgrade'
      }
    } catch {
      result.error = 'upgrade'
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.CollectionBookActionResult,
      result,
    )

    const refreshed = await CollectionBookManager.fetchAccountData(account)
    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.CollectionBookResponseData,
      refreshed,
    )
  }

  static async slotItems(request: CollectionBookSlotRequest) {
    const account = AccountsManager.getAccountById(request.accountId)
    const result: CollectionBookActionResult = {
      accountId: request.accountId,
      success: false,
      slotted: 0,
      failed: 0,
    }

    if (!account) {
      result.error = 'account'
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.CollectionBookActionResult,
        result,
      )
      return
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        result.error = 'auth'
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.CollectionBookActionResult,
          result,
        )
        return
      }

      let slotted = 0
      let failed = 0

      for (const itemId of request.itemIds) {
        if (!itemId) {
          continue
        }

        try {
          await setSlotItemIntoCollectionBook({
            accessToken,
            accountId: account.accountId,
            itemId,
          })
          slotted += 1
        } catch {
          failed += 1
        }
      }

      result.success = slotted > 0
      result.slotted = slotted
      result.failed = failed

      if (slotted <= 0) {
        result.error = 'slot'
      }
    } catch {
      result.error = 'slot'
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.CollectionBookActionResult,
      result,
    )

    const refreshed = await CollectionBookManager.fetchAccountData(account)
    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.CollectionBookResponseData,
      refreshed,
    )
  }
}
