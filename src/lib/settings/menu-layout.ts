export const MENU_FEATURE_KEYS = [
  'currentAlerts',
  'gamesLauncher',
  'autoKick',
  'taxiService',
  'party',
  'dailyQuests',
  'dqWeapons',
  'stormShields',
  'xpBoosts',
  'autoPinUrns',
  'llamaManager',
  'itemShop',
  'collectionBook',
  'accountInfo',
  'vbucksInformation',
  'cloudStorage',
  'accountExport',
  'redeemCodes',
  'devicesAuth',
  'epicGamesSettings',
  'eula',
  'matchmakingTrack',
  'worldInfo',
  'showTotalAccounts',
  'authorizationCode',
  'exchangeCode',
  'deviceAuth',
  'removeAccount',
] as const

export const MENU_GROUP_KEYS = [
  'general',
  'stwOperations',
  'accountManagement',
  'advancedMode',
  'myAccounts',
] as const

export type MenuFeatureKey = (typeof MENU_FEATURE_KEYS)[number]
export type MenuGroupKey = (typeof MENU_GROUP_KEYS)[number]
export type MenuVisibilityKey = MenuFeatureKey | MenuGroupKey
export type MenuBuiltinCategoryId = MenuGroupKey

const LEGACY_SOLO_CATEGORY_IDS = [
  'currentAlerts',
  'gamesLauncher',
  'missions',
  'utocModifier',
] as const

export type MenuCategory = {
  id: string
  name: string
  visible: boolean
  items: Array<MenuFeatureKey>
}

export const DEFAULT_CATEGORY_ITEMS: Record<
  MenuBuiltinCategoryId,
  Array<MenuFeatureKey>
> = {
  general: [
    'currentAlerts',
    'gamesLauncher',
  ],
  stwOperations: [
    'autoKick',
    'taxiService',
    'party',
    'dailyQuests',
    'dqWeapons',
    'stormShields',
    'xpBoosts',
    'autoPinUrns',
    'llamaManager',
    'itemShop',
    'collectionBook',
    'accountInfo',
  ],
  accountManagement: [
    'vbucksInformation',
    'cloudStorage',
    'accountExport',
    'redeemCodes',
    'devicesAuth',
    'epicGamesSettings',
    'eula',
  ],
  advancedMode: ['matchmakingTrack', 'worldInfo'],
  myAccounts: [
    'showTotalAccounts',
    'authorizationCode',
    'exchangeCode',
    'deviceAuth',
    'removeAccount',
  ],
}

const FEATURE_KEY_SET = new Set<string>(MENU_FEATURE_KEYS)
const BUILTIN_CATEGORY_IDS: Array<MenuBuiltinCategoryId> = [
  'general',
  'stwOperations',
  'accountManagement',
  'advancedMode',
  'myAccounts',
]

export function isMenuFeatureKey(value: string): value is MenuFeatureKey {
  return FEATURE_KEY_SET.has(value)
}

export function isMenuVisibilityKey(
  value: string,
): value is MenuVisibilityKey {
  return (
    isMenuFeatureKey(value) ||
    (MENU_GROUP_KEYS as ReadonlyArray<string>).includes(value)
  )
}

function isVisibleFlag(visibility: object, key: string) {
  return (visibility as Record<string, unknown>)[key] !== false
}

export function createDefaultMenuCategories(
  visibility: object = {},
): Array<MenuCategory> {
  return BUILTIN_CATEGORY_IDS.map((id) => ({
    id,
    name: '',
    visible: isVisibleFlag(visibility, id),
    items: [...DEFAULT_CATEGORY_ITEMS[id]],
  }))
}

export function normalizeMenuCategories(
  input: unknown,
  visibility: object = {},
): Array<MenuCategory> {
  if (!Array.isArray(input) || input.length <= 0) {
    return createDefaultMenuCategories(visibility)
  }

  const used = new Set<MenuFeatureKey>()
  const categories: Array<MenuCategory> = []
  const usedIds = new Set<string>()

  for (const raw of input) {
    if (!raw || typeof raw !== 'object') {
      continue
    }

    const row = raw as {
      id?: unknown
      name?: unknown
      visible?: unknown
      items?: unknown
    }

    const id =
      typeof row.id === 'string' && row.id.trim() !== ''
        ? row.id.trim()
        : createMenuCategoryId()

    if (usedIds.has(id)) {
      continue
    }

    usedIds.add(id)

    const items = Array.isArray(row.items)
      ? row.items.filter((item): item is MenuFeatureKey => {
          if (typeof item !== 'string' || !isMenuFeatureKey(item)) {
            return false
          }

          if (used.has(item)) {
            return false
          }

          used.add(item)

          return true
        })
      : []

    const builtinId = isBuiltinCategoryId(id) ? id : null

    categories.push({
      id,
      name: typeof row.name === 'string' ? row.name : '',
      visible:
        typeof row.visible === 'boolean'
          ? row.visible
          : builtinId
            ? isVisibleFlag(visibility, builtinId)
            : true,
      items,
    })
  }

  const folded = foldLegacySoloCategories(categories, visibility)
  const missing = MENU_FEATURE_KEYS.filter(
    (key) => !folded.some((category) => category.items.includes(key)),
  )

  if (missing.length > 0) {
    attachMissingItems(folded, missing, visibility)
  }

  relocateCloudStorageToAccountManagement(folded, visibility)

  return folded.length > 0
    ? folded
    : createDefaultMenuCategories(visibility)
}

export function createMenuCategoryId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `menu-${crypto.randomUUID()}`
  }

  return `menu-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function isBuiltinCategoryId(
  value: string,
): value is MenuBuiltinCategoryId {
  return BUILTIN_CATEGORY_IDS.includes(value as MenuBuiltinCategoryId)
}

export function isUntitledTopLevelCategory(category: MenuCategory) {
  return category.id === 'general' && category.name.trim() === ''
}

export function pruneEmptySoloCategories(
  categories: Array<MenuCategory>,
): Array<MenuCategory> {
  return categories.filter((category) => {
    if (category.items.length > 0) {
      return true
    }

    return !(LEGACY_SOLO_CATEGORY_IDS as ReadonlyArray<string>).includes(
      category.id,
    )
  })
}

export function moveMenuItem(
  categories: Array<MenuCategory>,
  item: MenuFeatureKey,
  toCategoryId: string,
  toIndex?: number,
): Array<MenuCategory> {
  const moved = categories.map((category) => {
    const without = category.items.filter((current) => current !== item)

    if (category.id !== toCategoryId) {
      return {
        ...category,
        items: without,
      }
    }

    const index =
      toIndex === undefined
        ? without.length
        : Math.max(0, Math.min(toIndex, without.length))

    return {
      ...category,
      items: [...without.slice(0, index), item, ...without.slice(index)],
    }
  })

  return pruneEmptySoloCategories(moved)
}

export function reorderMenuCategories(
  categories: Array<MenuCategory>,
  fromId: string,
  toId: string,
  place: 'before' | 'after' = 'before',
): Array<MenuCategory> {
  const fromIndex = categories.findIndex((category) => category.id === fromId)

  if (fromIndex < 0 || fromId === toId) {
    return categories
  }

  const next = [...categories]
  const [moved] = next.splice(fromIndex, 1)
  const toIndex = next.findIndex((category) => category.id === toId)

  if (toIndex < 0) {
    return categories
  }

  next.splice(place === 'after' ? toIndex + 1 : toIndex, 0, moved)

  return next
}

function foldLegacySoloCategories(
  categories: Array<MenuCategory>,
  visibility: object,
): Array<MenuCategory> {
  const legacyIds: ReadonlyArray<string> = LEGACY_SOLO_CATEGORY_IDS
  const hasLegacy = categories.some((category) =>
    legacyIds.includes(category.id),
  )

  if (!hasLegacy) {
    return categories
  }

  const collected: Array<MenuFeatureKey> = []
  const seen = new Set<MenuFeatureKey>()

  for (const id of LEGACY_SOLO_CATEGORY_IDS) {
    const legacy = categories.find((category) => category.id === id)

    if (!legacy) {
      continue
    }

    for (const item of legacy.items) {
      if (seen.has(item)) {
        continue
      }

      seen.add(item)
      collected.push(item)
    }
  }

  const withoutLegacy = categories.filter(
    (category) => !legacyIds.includes(category.id),
  )
  const existingGeneral = withoutLegacy.find(
    (category) => category.id === 'general',
  )

  if (existingGeneral) {
    for (const item of collected) {
      if (!existingGeneral.items.includes(item)) {
        existingGeneral.items.push(item)
      }
    }

    return withoutLegacy
  }

  let insertAt = 0

  for (const category of categories) {
    if (legacyIds.includes(category.id)) {
      break
    }

    insertAt += 1
  }

  const adjusted = withoutLegacy.length < insertAt ? withoutLegacy.length : insertAt

  withoutLegacy.splice(adjusted, 0, {
    id: 'general',
    name: '',
    visible: isVisibleFlag(visibility, 'general'),
    items: collected,
  })

  return withoutLegacy
}

function relocateCloudStorageToAccountManagement(
  categories: Array<MenuCategory>,
  visibility: object,
) {
  const source = categories.find((category) => category.id === 'stwOperations')

  if (!source || !source.items.includes('cloudStorage')) {
    return
  }

  source.items = source.items.filter((item) => item !== 'cloudStorage')

  const dest = categories.find((category) => category.id === 'accountManagement')

  if (dest) {
    if (!dest.items.includes('cloudStorage')) {
      dest.items.splice(1, 0, 'cloudStorage')
    }

    return
  }

  const insertAt = defaultInsertIndex(categories, 'accountManagement')

  categories.splice(insertAt, 0, {
    id: 'accountManagement',
    name: '',
    visible: isVisibleFlag(visibility, 'accountManagement'),
    items: ['cloudStorage'],
  })
}

function attachMissingItems(
  categories: Array<MenuCategory>,
  missing: Array<MenuFeatureKey>,
  visibility: object,
) {
  const byDefault = new Map<MenuFeatureKey, MenuBuiltinCategoryId>()

  for (const builtinId of BUILTIN_CATEGORY_IDS) {
    for (const item of DEFAULT_CATEGORY_ITEMS[builtinId]) {
      byDefault.set(item, builtinId)
    }
  }

  for (const key of missing) {
    const builtinId = byDefault.get(key)
    const existing = builtinId
      ? categories.find((category) => category.id === builtinId)
      : null

    if (existing) {
      existing.items.push(key)
      continue
    }

    if (builtinId) {
      const insertAt = defaultInsertIndex(categories, builtinId)

      categories.splice(insertAt, 0, {
        id: builtinId,
        name: '',
        visible: isVisibleFlag(visibility, builtinId),
        items: [key],
      })
      continue
    }

    if (categories[0]) {
      categories[0].items.push(key)
    }
  }
}

function defaultInsertIndex(
  categories: Array<MenuCategory>,
  builtinId: MenuBuiltinCategoryId,
) {
  const orderIndex = BUILTIN_CATEGORY_IDS.indexOf(builtinId)

  for (let index = orderIndex + 1; index < BUILTIN_CATEGORY_IDS.length; index++) {
    const laterIndex = categories.findIndex(
      (category) => category.id === BUILTIN_CATEGORY_IDS[index],
    )

    if (laterIndex >= 0) {
      return laterIndex
    }
  }

  return categories.length
}

export function unassignedMenuItems(
  categories: Array<MenuCategory>,
): Array<MenuFeatureKey> {
  const used = new Set(categories.flatMap((category) => category.items))

  return MENU_FEATURE_KEYS.filter((key) => !used.has(key))
}
