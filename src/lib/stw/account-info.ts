import type {
  AccountInfoAccountData,
  AccountInfoItem,
  AccountInfoKind,
  AccountInfoProfileId,
  AccountInfoRarity,
  AccountInfoResource,
  AccountInfoXp,
} from '../../types/account-info'
import type { MCPQueryProfileChanges } from '../../types/services/mcp'

import { individualLimitBoostedXP } from '../../config/constants/xpboosts'
import {
  extractBoostedXP,
  extractCommanderLevel,
  extractXPBoosts,
} from '../parsers/query-profile'
import { parseResource } from '../parsers/resources'
import {
  formatWeaponPerk,
  itemAlterations,
  parseSchematicRarity,
  schematicDisplayName,
  schematicIconUrl,
  schematicPowerLevel,
} from './dq-weapons'
import { itemIconUrl } from './item-icons'
import { emptyVentureTrack, parseVentureTrack } from './ventures'
import { assets } from '../repository'

type ProfileItem = {
  templateId?: string
  quantity?: number
  attributes?: Record<string, unknown>
}

type ProfileLike = {
  items?: Record<string, unknown>
  stats?: {
    attributes?: Record<string, unknown>
  }
} | null

const RARITY_RANK: Record<AccountInfoRarity, number> = {
  c: 0,
  uc: 1,
  r: 2,
  vr: 3,
  sr: 4,
  ur: 5,
  er: 6,
}

const RESOURCE_ORDER = [
  'wooditemdata',
  'stoneitemdata',
  'metalitemdata',
  'twine_t01',
  'twine_t02',
  'twine_t03',
  'twine_t04',
  'twine_t05',
  'twine_t06',
  'planks',
  'reagent_c_t01',
  'reagent_c_t02',
  'reagent_c_t03',
  'reagent_c_t04',
  'heroxp',
  'schematicxp',
  'personnelxp',
  'peoplexp',
  'phoenixxp',
  'reagent_people',
  'reagent_schematic',
  'reagent_traps',
  'reagent_weapons',
  'reagent_alteration_generic',
  'reagent_alteration_upgrade_sr',
  'reagent_alteration_upgrade_vr',
  'reagent_alteration_upgrade_r',
  'reagent_alteration_upgrade_uc',
  'reagent_evolverarity_sr',
  'reagent_evolverarity_vr',
  'reagent_evolverarity_r',
  'reagent_promotion_heroes',
  'reagent_promotion_survivors',
  'reagent_promotion_weapons',
  'reagent_promotion_traps',
]

const MIADSC = 'https://api.miadsc.xyz/assets/stw'

const XP_PER_LEVEL = 80_000
const BR_XP_CAP = 4_000_000
const CREATIVE_XP_CAP = 4_000_000
const STW_XP_CAP = 3_200_000
const STW_ACCOLADE_TRACKER = 'Token:stw_accolade_tracker'

/** Friday. BR, Reload, OG, Lego and Festival share this weekly reset. */
export const BR_XP_RESET_WEEKDAY = 5
/** Tuesday. Save the World accolade XP resets on its own day. */
export const STW_XP_RESET_WEEKDAY = 2

export function emptyBattlePassXp(): AccountInfoXp {
  return {
    level: 0,
    levelXp: 0,
    xpPerLevel: XP_PER_LEVEL,
    br: { current: 0, cap: BR_XP_CAP },
    creative: { current: 0, cap: CREATIVE_XP_CAP },
    stw: { current: 0, cap: STW_XP_CAP },
  }
}

function finiteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export function parseBattlePassXp(
  athena: ProfileLike,
  campaign: ProfileLike
): AccountInfoXp {
  const xp = emptyBattlePassXp()
  const attributes = athena?.stats?.attributes ?? {}
  const playtime = attributes.playtime_xp
  const creative = attributes.creative_dynamic_xp

  xp.level = finiteNumber(attributes.book_level)
  xp.levelXp = finiteNumber(attributes.book_xp)

  if (playtime && typeof playtime === 'object') {
    xp.br.current = finiteNumber(
      (playtime as { currentWeekXp?: unknown }).currentWeekXp
    )
  }

  if (creative && typeof creative === 'object') {
    xp.creative.current = finiteNumber(
      (creative as { currentWeekXp?: unknown }).currentWeekXp
    )
  }

  const items = campaign?.items ?? {}

  for (const item of Object.values(items)) {
    const row = item as ProfileItem | null

    if (row?.templateId !== STW_ACCOLADE_TRACKER) {
      continue
    }

    xp.stw.current = finiteNumber(row.attributes?.weekly_xp)
    break
  }

  return xp
}

const CAMPAIGN_RESOURCE_TYPES = new Set([
  'accountresource',
  'consumableaccountitem',
])

const BACKPACK_MATERIAL_TYPES = new Set([
  'ingredient',
  'worlditem',
  'ammo',
])

const INVENTORY_TYPES = new Set([
  'schematic',
  'weapon',
  'trap',
  'ingredient',
  'worlditem',
  'ammo',
  'gadget',
])

export function emptyAccountInfo(
  accountId: string,
  available = false
): AccountInfoAccountData {
  return {
    accountId,
    available,
    xp: emptyBattlePassXp(),
    commander: { baseLevel: 0, postLevel: 0, total: 0 },
    xpBoosts: { personal: 0, teammate: 0, applied: 0, boostedXP: 0 },
    resources: [],
    backpack: [],
    storage: [],
    ventures: [],
    venturesTrack: emptyVentureTrack(),
  }
}

const AMMO_NAMES: Record<string, string> = {
  ammodatabulletslight: 'Light Bullets',
  ammodatabulletsmedium: 'Medium Bullets',
  ammodatabulletsheavy: 'Heavy Bullets',
  ammodatashells: 'Shells',
  ammodataenergycell: 'Energy Cells',
  ammodataexplosive: 'Rockets',
}

export function dedicatedIconUrl(templateId: string) {
  const [type, rawId] = splitTemplate(templateId)
  const id = rawId || templateId

  if (type === 'ammo') {
    return `${MIADSC}/ammo/${id.toLowerCase()}.png`
  }

  if (type === 'hero' || type === 'worker') {
    return itemIconUrl(templateId) || `${MIADSC}/items/${id}.png`
  }

  if (
    type === 'schematic' ||
    type === 'weapon' ||
    type === 'trap' ||
    type === ''
  ) {
    return schematicIconUrl(templateId)
  }

  const local = uniqueLocalUrl(templateId)

  if (local) {
    return local
  }

  if (type === 'accountresource' || type === 'consumableaccountitem') {
    return `${MIADSC}/resources/${id}.png`
  }

  return `${MIADSC}/items/${id}.png`
}

export function rarityBorderClass(rarity: AccountInfoRarity) {
  switch (rarity) {
    case 'sr':
      return 'border-amber-400 bg-gradient-to-b from-amber-950/80 to-zinc-950'
    case 'vr':
      return 'border-purple-500 bg-gradient-to-b from-purple-950/80 to-zinc-950'
    case 'r':
      return 'border-blue-500 bg-gradient-to-b from-blue-950/80 to-zinc-950'
    case 'uc':
      return 'border-green-500 bg-gradient-to-b from-green-950/80 to-zinc-950'
    case 'ur':
    case 'er':
      return 'border-orange-400 bg-gradient-to-b from-orange-950/80 to-zinc-950'
    default:
      return 'border-zinc-400 bg-gradient-to-b from-zinc-800 to-zinc-950'
  }
}

function splitTemplate(templateId: string) {
  const index = templateId.indexOf(':')

  if (index < 0) {
    return ['', templateId] as const
  }

  return [
    templateId.slice(0, index).toLowerCase(),
    templateId.slice(index + 1),
  ] as const
}

function itemRarity(templateId: string): AccountInfoRarity {
  const parsed = parseSchematicRarity(templateId)

  if (parsed) {
    return parsed
  }

  const lower = templateId.toLowerCase()

  if (lower.includes('_ur_') || lower.endsWith('_ur')) {
    return 'ur'
  }

  return 'c'
}

function numAttr(attributes: Record<string, unknown> | undefined, key: string) {
  const value = attributes?.[key]

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)

    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function hasAttr(attributes: Record<string, unknown> | undefined, key: string) {
  return attributes != null && Object.prototype.hasOwnProperty.call(attributes, key)
}

function rarityLabel(rarity: AccountInfoRarity) {
  switch (rarity) {
    case 'sr':
      return 'Legendary'
    case 'vr':
      return 'Epic'
    case 'r':
      return 'Rare'
    case 'uc':
      return 'Uncommon'
    case 'ur':
    case 'er':
      return 'Mythic'
    default:
      return 'Common'
  }
}

export function isTrapTemplate(templateId: string) {
  const [type, id] = splitTemplate(templateId)
  const lower = `${type}:${id}`.toLowerCase()

  return (
    type === 'trap' ||
    /sid_(floor|wall|ceiling)/.test(lower) ||
    /(^|_)tid_/.test(lower)
  )
}

function materialLookupKey(templateId: string) {
  const [, id] = splitTemplate(templateId)

  return id.replace(/^ingredient_/i, '').toLowerCase()
}

function lookupParsed(templateId: string, quantity: number) {
  const parsed = parseResource({
    key: templateId,
    quantity,
  })

  if (parsed.type) {
    return parsed
  }

  return parseResource({
    key: materialLookupKey(templateId),
    quantity,
  })
}

function uniqueLocalUrl(templateId: string) {
  const parsed = lookupParsed(templateId, 1)

  if (
    parsed.type === 'trap' ||
    parsed.type === 'resource' ||
    parsed.type === 'ingredient'
  ) {
    return parsed.imgUrl
  }

  const key = materialLookupKey(templateId)
  const local = assets(key)

  if (local) {
    return local
  }

  return undefined
}

function isHiddenInventoryItem(templateId: string) {
  const lower = templateId.toLowerCase()

  return (
    lower.includes('buildingitemdata') ||
    lower.includes('edittool')
  )
}

function kindFromTemplate(templateId: string): AccountInfoKind | null {
  const [type, id] = splitTemplate(templateId)
  const lower = `${type}:${id}`.toLowerCase()

  if (isHiddenInventoryItem(templateId)) {
    return null
  }

  if (isTrapTemplate(templateId)) {
    return 'trap'
  }

  if (type === 'weapon' || type === 'schematic' || /(^|:)wid_/.test(lower)) {
    return 'weapon'
  }

  if (type === 'gadget' || /hoverboard|vacuum/.test(lower)) {
    return 'gadget'
  }

  if (BACKPACK_MATERIAL_TYPES.has(type) || CAMPAIGN_RESOURCE_TYPES.has(type)) {
    return 'resource'
  }

  if (INVENTORY_TYPES.has(type)) {
    return 'weapon'
  }

  return null
}

function displayName(templateId: string, kind: AccountInfoKind) {
  const ammoName = AMMO_NAMES[materialLookupKey(templateId)]

  if (ammoName) {
    return ammoName
  }

  const parsed = lookupParsed(templateId, 1)

  if (parsed.type && parsed.name && parsed.name !== parsed.type) {
    return parsed.name
  }

  if (kind === 'weapon' || kind === 'trap' || kind === 'gadget') {
    return schematicDisplayName(templateId)
  }

  const key = materialLookupKey(templateId)
    .replace(/_/g, ' ')
    .trim()

  if (!key) {
    return templateId
  }

  return key
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function kindLabel(kind: AccountInfoKind) {
  switch (kind) {
    case 'trap':
      return 'Trap'
    case 'gadget':
      return 'Gadget'
    case 'resource':
      return 'Material'
    default:
      return 'Weapon'
  }
}

function buildInventoryItem(
  itemId: string,
  item: ProfileItem,
  profileId: AccountInfoProfileId
): AccountInfoItem | null {
  const templateId = item.templateId ?? ''
  const type = splitTemplate(templateId)[0]
  const kind = kindFromTemplate(templateId)

  if (!kind || isHiddenInventoryItem(templateId)) {
    return null
  }

  if (!INVENTORY_TYPES.has(type) && kind === 'weapon' && type !== '') {
    return null
  }

  const attributes = item.attributes ?? {}
  const level = numAttr(attributes, 'level')
  const rarity = itemRarity(templateId)
  const parsed = lookupParsed(templateId, item.quantity ?? 1)
  const alterations = itemAlterations(attributes)
  const local = uniqueLocalUrl(templateId)
  const quantity = item.quantity ?? 1
  const name = displayName(templateId, kind)

  return {
    itemId,
    templateId,
    kind,
    name,
    meta: `${kindLabel(kind)} · ${rarityLabel(rarity)}${
      level > 0 ? ` · Lv ${level}` : ''
    }`,
    rarity,
    power:
      kind === 'weapon' || kind === 'trap'
        ? schematicPowerLevel(templateId, level || 1)
        : 0,
    quantity,
    level,
    durability: numAttr(attributes, 'durability'),
    maxDurability:
      numAttr(attributes, 'max_durability') ||
      numAttr(attributes, 'MaxDurability') ||
      numAttr(attributes, 'maxDurability'),
    loadedAmmo: hasAttr(attributes, 'loadedAmmo')
      ? numAttr(attributes, 'loadedAmmo')
      : null,
    favorite: attributes.favorite === true,
    imageUrl: dedicatedIconUrl(templateId),
    fallbackUrl:
      local || parsed.fallbackUrl || parsed.imgUrl || assets('question'),
    alterations,
    profileId,
  }
}

function sortItems(left: AccountInfoItem, right: AccountInfoItem) {
  const kindRank = (kind: AccountInfoKind) => {
    if (kind === 'weapon') {
      return 0
    }

    if (kind === 'trap') {
      return 1
    }

    if (kind === 'gadget') {
      return 2
    }

    return 3
  }

  const kind = kindRank(left.kind) - kindRank(right.kind)

  if (kind !== 0) {
    return kind
  }

  const rarity = RARITY_RANK[right.rarity] - RARITY_RANK[left.rarity]

  if (rarity !== 0) {
    return rarity
  }

  if (right.power !== left.power) {
    return right.power - left.power
  }

  if (right.quantity !== left.quantity) {
    return right.quantity - left.quantity
  }

  return left.name.localeCompare(right.name)
}

function parseInventory(
  profile: ProfileLike,
  profileId: AccountInfoProfileId
) {
  const items: Array<AccountInfoItem> = []

  Object.entries(profile?.items ?? {}).forEach(([itemId, raw]) => {
    const built = buildInventoryItem(
      itemId,
      (raw ?? {}) as ProfileItem,
      profileId
    )

    if (built) {
      items.push(built)
    }
  })

  items.sort(sortItems)

  return items
}

function buildResource(
  templateId: string,
  quantity: number
): AccountInfoResource | null {
  if (quantity <= 0) {
    return null
  }

  const type = splitTemplate(templateId)[0]

  if (templateId === 'ConsumableAccountItem:smallxpboost') {
    return {
      templateId,
      name: 'XP Boosts',
      quantity,
      imageUrl: assets('smallxpboost') || dedicatedIconUrl(templateId),
      fallbackUrl: assets('smallxpboost') || assets('question'),
      rarity: 'vr',
    }
  }

  if (templateId === 'ConsumableAccountItem:smallxpboost_gift') {
    return {
      templateId,
      name: 'Teammate XP Boosts',
      quantity,
      imageUrl: assets('smallxpboost_gift') || dedicatedIconUrl(templateId),
      fallbackUrl: assets('smallxpboost_gift') || assets('question'),
      rarity: 'r',
    }
  }

  if (!CAMPAIGN_RESOURCE_TYPES.has(type)) {
    return null
  }

  const parsed = lookupParsed(templateId, quantity)
  const local = uniqueLocalUrl(templateId)
  const name =
    parsed.type && parsed.name && parsed.name !== parsed.type
      ? parsed.name
      : displayName(templateId, 'resource')

  return {
    templateId,
    name,
    quantity,
    imageUrl: local || parsed.imgUrl || dedicatedIconUrl(templateId),
    fallbackUrl: local || parsed.fallbackUrl || parsed.imgUrl || assets('question'),
    rarity: itemRarity(templateId),
  }
}

function parseResources(profile: ProfileLike) {
  const resources: Array<AccountInfoResource> = []

  Object.entries(profile?.items ?? {}).forEach(([, raw]) => {
    const item = (raw ?? {}) as ProfileItem
    const built = buildResource(item.templateId ?? '', item.quantity ?? 0)

    if (built) {
      resources.push(built)
    }
  })

  return resources
}

function mergeResources(lists: Array<Array<AccountInfoResource>>) {
  const merged = new Map<string, AccountInfoResource>()

  lists.flat().forEach((resource) => {
    const current = merged.get(resource.templateId)

    if (current) {
      current.quantity += resource.quantity
      return
    }

    merged.set(resource.templateId, { ...resource })
  })

  const resources = Array.from(merged.values())

  resources.sort((left, right) => {
    const leftKey = materialLookupKey(left.templateId)
    const rightKey = materialLookupKey(right.templateId)
    const leftIndex = RESOURCE_ORDER.indexOf(leftKey)
    const rightIndex = RESOURCE_ORDER.indexOf(rightKey)

    if (leftIndex >= 0 || rightIndex >= 0) {
      return (
        (leftIndex >= 0 ? leftIndex : 999) -
        (rightIndex >= 0 ? rightIndex : 999)
      )
    }

    return left.name.localeCompare(right.name)
  })

  return resources
}

export function parseAccountInfo(
  accountId: string,
  campaign: ProfileLike,
  backpack: ProfileLike,
  storage: ProfileLike,
  ventures: ProfileLike,
  athena: ProfileLike = null
): AccountInfoAccountData {
  const empty = emptyAccountInfo(accountId, Boolean(campaign))

  if (!campaign) {
    empty.available = false
    empty.errorMessage = 'Unknown Error'

    return empty
  }

  const change = { profile: campaign } as MCPQueryProfileChanges
  let commander = { baseLevel: 0, postLevel: 0, total: 0 }

  try {
    commander = extractCommanderLevel(change)
  } catch {
    commander = { baseLevel: 0, postLevel: 0, total: 0 }
  }

  const xpBoosts = extractXPBoosts(change)
  const boostedXP = extractBoostedXP(change)
  const applied =
    individualLimitBoostedXP > 0
      ? Math.round(boostedXP / individualLimitBoostedXP)
      : 0

  return {
    accountId,
    available: true,
    xp: parseBattlePassXp(athena, campaign),
    commander,
    xpBoosts: {
      personal: xpBoosts.personal,
      teammate: xpBoosts.teammate,
      applied,
      boostedXP,
    },
    resources: mergeResources([parseResources(campaign)]),
    backpack: parseInventory(backpack, 'theater0'),
    storage: parseInventory(storage, 'outpost0'),
    ventures: parseInventory(ventures, 'theater2'),
    venturesTrack: parseVentureTrack(
      (campaign.items ?? {}) as Record<string, unknown>
    ),
  }
}

export function inspectRows(item: AccountInfoItem) {
  return item.alterations.slice(0, 6).map((alteration) =>
    formatWeaponPerk(alteration)
  )
}

export { RARITY_RANK }
