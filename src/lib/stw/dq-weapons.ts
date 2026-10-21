import { epicAssetFileName } from './item-icons'

export const DQ_WEAPON_KINDS = [
  'smg',
  'pistol',
  'assault',
  'shotgun',
  'sniper',
  'melee',
] as const

export type DqWeaponKind = (typeof DQ_WEAPON_KINDS)[number]

export type SchematicRarity = 'c' | 'uc' | 'r' | 'vr' | 'sr' | 'ur'

export type DqWeaponMatch = {
  kind: DqWeaponKind
  itemId: string
  name: string
  templateId: string
  perkCount: number
  level: number
  power: number
  rarity: SchematicRarity | null
  star: number
  alterations: Array<string>
  alterationBaseRarities: Array<string>
  imageUrl: string
}

export type WeaponPerkRow = {
  id: string
  label: string
  rarity: SchematicRarity | null
  filled: number
  isLamp: boolean
}

export const SCHEMATIC_RARITY_LABELS: Record<SchematicRarity, string> = {
  c: 'Common',
  uc: 'Uncommon',
  r: 'Rare',
  vr: 'Epic',
  sr: 'Legendary',
  ur: 'Mythic',
}

export const LAMP_PERK_TEXT =
  'Eliminating an enemy with this weapon causes chain lightning to strike up to 6 enemies.'

const SID_PATH_FIXES: Array<[RegExp, string]> = [
  [/^sid_pistol_auto_vacuumtube_/, 'sid_pistol_vacuumtube_auto_'],
]

export function schematicIconUrl(templateId: string) {
  const colon = templateId.indexOf(':')
  let raw = (colon >= 0 ? templateId.slice(colon + 1) : templateId).toLowerCase()

  raw = raw.replace(/^wid_/, 'sid_').replace(/^tid_/, 'sid_')
  raw = raw.replace(/_(ore|crystal)_t\d+$/, '_ore_t01')

  SID_PATH_FIXES.forEach(([from, to]) => {
    raw = raw.replace(from, to)
  })

  return `https://api.miadsc.xyz/assets/stw/schematics/${epicAssetFileName(raw)}.png`
}

const EMPTY_SLOT = /^(none|null|undefined)?$/i

const RARITY_FROM_ID =
  /_(c|uc|r|vr|sr|ur)(?:_(?:ore|crystal)_t\d+)?$/i
const TIER_FROM_ID = /_t(\d+)(?:$|[^0-9])/i

type PowerBand = {
  star: number
  start: number
  values: ReadonlyArray<number>
}

// In-game schematic/weapon Power by rarity + star + level (H/W/T/D/S table).
const POWER_TABLE: Record<SchematicRarity, ReadonlyArray<PowerBand>> = {
  c: [{ star: 1, start: 1, values: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11] }],
  uc: [
    { star: 1, start: 1, values: [4, 5, 6, 8, 9, 10, 11, 13, 14, 15] },
    { star: 2, start: 10, values: [21, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35] },
    { star: 3, start: 20, values: [43, 45, 46, 47, 49, 50, 51, 53, 54, 55, 57] },
  ],
  r: [
    { star: 1, start: 1, values: [7, 8, 9, 11, 12, 13, 15, 16, 17, 19] },
    { star: 2, start: 10, values: [26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 41] },
    { star: 3, start: 20, values: [49, 51, 52, 54, 55, 56, 58, 59, 61, 62, 64] },
    { star: 4, start: 30, values: [74, 75, 77, 78, 80, 81, 83, 84, 86, 87, 89] },
  ],
  vr: [
    { star: 1, start: 1, values: [9, 11, 12, 14, 15, 17, 18, 20, 21, 22] },
    { star: 2, start: 10, values: [30, 32, 34, 35, 37, 39, 40, 42, 43, 45, 46] },
    { star: 3, start: 20, values: [54, 56, 58, 60, 61, 63, 65, 66, 68, 69, 71] },
    { star: 4, start: 30, values: [81, 83, 84, 86, 87, 89, 91, 92, 94, 96, 97] },
    {
      star: 5,
      start: 40,
      values: [108, 110, 111, 112, 114, 115, 116, 118, 119, 120, 122],
    },
  ],
  sr: [
    { star: 1, start: 1, values: [12, 14, 15, 17, 18, 20, 21, 23, 24, 26] },
    { star: 2, start: 10, values: [35, 36, 38, 40, 42, 43, 45, 46, 48, 49, 51] },
    { star: 3, start: 20, values: [61, 62, 64, 66, 68, 69, 71, 73, 74, 76, 77] },
    { star: 4, start: 30, values: [88, 90, 92, 94, 95, 97, 99, 101, 102, 104, 106] },
    {
      star: 5,
      start: 40,
      values: [116, 117, 118, 120, 121, 123, 124, 126, 127, 129, 130],
    },
  ],
  ur: [
    { star: 1, start: 1, values: [25, 27, 28, 30, 32, 33, 35, 37, 38, 40] },
    { star: 2, start: 10, values: [50, 51, 53, 55, 56, 58, 60, 61, 63, 64, 66] },
    { star: 3, start: 20, values: [76, 78, 79, 81, 83, 84, 86, 87, 89, 91, 92] },
    {
      star: 4,
      start: 30,
      values: [102, 104, 106, 107, 109, 110, 112, 114, 115, 117, 119],
    },
    {
      star: 5,
      start: 40,
      values: [129, 130, 132, 133, 135, 137, 138, 140, 142, 143, 145],
    },
  ],
}

const SUPERCHARGE_POWER: Record<SchematicRarity, Record<number, number>> = {
  c: {},
  uc: {},
  r: {},
  vr: { 52: 124, 54: 127, 56: 130, 58: 133, 60: 136 },
  sr: { 52: 132, 54: 136, 56: 139, 58: 142, 60: 144 },
  ur: { 52: 147, 54: 150, 56: 152, 58: 154, 60: 156 },
}

export function itemAlterations(attributes?: Record<string, unknown>) {
  if (!attributes) {
    return []
  }

  const raw = attributes.alterations ?? attributes.alterationDefinitions
  const list = Array.isArray(raw) ? raw : []

  return list.filter(
    (value): value is string =>
      typeof value === 'string' && !EMPTY_SLOT.test(value.trim())
  )
}

export function itemAlterationBaseRarities(
  attributes?: Record<string, unknown>
) {
  if (!attributes) {
    return []
  }

  const raw = attributes.alteration_base_rarities
  const list = Array.isArray(raw) ? raw : []

  return list.filter((value): value is string => typeof value === 'string')
}

export function isChainLightningAlteration(alteration: string) {
  const id = alteration.toLowerCase().replace(/[^a-z0-9]/g, '')

  return id.includes('chainlightning')
}

export function isLampWeapon(alterations: Array<string>) {
  return (
    alterations.length >= 6 && alterations.some(isChainLightningAlteration)
  )
}

function idTokens(body: string) {
  return body.split('_').filter(Boolean)
}

function isSmgTemplate(body: string) {
  if (
    body.includes('_smg_') ||
    /(^|_)(sid|wid)_smg/.test(body) ||
    body.includes('burstfiresmg')
  ) {
    return true
  }

  const parts = idTokens(body)
  const isPistol = parts.includes('pistol')
  const isAssault = parts.includes('assault')
  const hasAuto = parts.includes('auto') || parts.includes('autoheavy')
  const hasAutoDrum = parts.includes('autodrum')
  const isRatRod = parts.includes('ratrod')
  const isMilitary = parts.includes('military')

  if (isPistol && hasAuto) {
    return true
  }

  if (isPistol && parts.includes('blackmetal')) {
    return true
  }

  if (isAssault && hasAutoDrum && !isRatRod) {
    return true
  }

  if (isAssault && hasAuto && isMilitary) {
    return true
  }

  return false
}

export function classifyDqWeapon(templateId: string): DqWeaponKind | null {
  const id = templateId.toLowerCase()
  const body = id.replace(/^(schematic|weapon):/, '')

  if (
    body.includes('sid_floor') ||
    body.includes('sid_wall') ||
    body.includes('sid_ceiling') ||
    body.includes('tid_') ||
    body.includes('_trap_') ||
    body.includes('_launcher_') ||
    body.includes('_explosive_')
  ) {
    return null
  }

  if (
    body.includes('_edged_') ||
    body.includes('_blunt_') ||
    body.includes('_piercing_') ||
    body.includes('_melee_') ||
    /(^|_)(sid|wid)_(edged|blunt|piercing)/.test(body)
  ) {
    return 'melee'
  }

  if (isSmgTemplate(body)) {
    return 'smg'
  }

  const isBow = body.includes('_bow_') || body.includes('crossbow')

  if (body.includes('_shotgun_') || /(^|_)(sid|wid)_shotgun/.test(body)) {
    return 'shotgun'
  }

  if (
    (body.includes('_sniper_') || /(^|_)(sid|wid)_sniper/.test(body)) &&
    !isBow
  ) {
    return 'sniper'
  }

  if (body.includes('_pistol_') || /(^|_)(sid|wid)_pistol/.test(body)) {
    return 'pistol'
  }

  if (body.includes('_assault_') || /(^|_)(sid|wid)_assault/.test(body)) {
    return 'assault'
  }

  return null
}

export function schematicDisplayName(templateId: string) {
  const body = templateId.replace(/^(Schematic|Weapon):/i, '')
  const cleaned = body
    .replace(/^(sid|wid)_/i, '')
    .replace(/_(c|uc|r|vr|sr|ur)_(ore|crystal)_t\d+$/i, '')
    .replace(/_(c|uc|r|vr|sr|ur)$/i, '')
    .replace(/_/g, ' ')
    .trim()

  if (!cleaned) {
    return templateId
  }

  const renamed = cleaned
    .replace(/vacuumtube/gi, 'Vacuum Tube')
    .replace(/retroscifi/gi, 'Retro Sci-Fi')
    .replace(/autodrum/gi, 'Auto Drum')
    .replace(/autoheavy/gi, 'Auto Heavy')
    .replace(/burstfiresmg/gi, 'Burst Fire SMG')
    .replace(/blackmetal/gi, 'Black Metal')

  return renamed
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function parseSchematicRarity(
  templateId: string
): SchematicRarity | null {
  const match = templateId.toLowerCase().match(RARITY_FROM_ID)

  if (!match?.[1]) {
    return null
  }

  return match[1] as SchematicRarity
}

function starFromLevel(level: number) {
  if (level <= 10) {
    return 1
  }

  if (level <= 20) {
    return 2
  }

  if (level <= 30) {
    return 3
  }

  if (level <= 40) {
    return 4
  }

  return 5
}

export function parseSchematicStar(templateId: string, level: number) {
  const match = templateId.toLowerCase().match(TIER_FROM_ID)
  const fromId = match?.[1] ? Number.parseInt(match[1], 10) : 0

  if (fromId >= 1) {
    return Math.min(5, fromId)
  }

  return starFromLevel(level)
}

function lookupPower(
  rarity: SchematicRarity,
  star: number,
  level: number
): number | null {
  if (level > 50) {
    const supercharged = SUPERCHARGE_POWER[rarity][level]

    if (typeof supercharged === 'number') {
      return supercharged
    }

    const even = SUPERCHARGE_POWER[rarity][level - 1]
    const odd = SUPERCHARGE_POWER[rarity][level + 1]

    if (typeof even === 'number' && typeof odd === 'number') {
      return Math.round((even + odd) / 2)
    }
  }

  const bands = POWER_TABLE[rarity]
  const band = bands.find((entry) => entry.star === star)

  if (!band) {
    return null
  }

  const index = level - band.start

  if (index < 0 || index >= band.values.length) {
    return null
  }

  return band.values[index] ?? null
}

export function schematicPowerLevel(templateId: string, level: number) {
  const safeLevel = Number.isFinite(level) ? Math.max(0, Math.floor(level)) : 0

  if (safeLevel <= 0) {
    return 0
  }

  const rarity = parseSchematicRarity(templateId)

  if (!rarity) {
    return safeLevel
  }

  const star = parseSchematicStar(templateId, safeLevel)
  const power = lookupPower(rarity, star, safeLevel)

  if (typeof power === 'number') {
    return power
  }

  const fallbackStar = Math.min(star, POWER_TABLE[rarity].length)
  const fallback = lookupPower(rarity, fallbackStar, safeLevel)

  return fallback ?? safeLevel
}

export function emptyKindMap(): Record<DqWeaponKind, DqWeaponMatch | null> {
  return {
    smg: null,
    pistol: null,
    assault: null,
    shotgun: null,
    sniper: null,
    melee: null,
  }
}

export function pickBetterMatch(current: DqWeaponMatch, next: DqWeaponMatch) {
  if (next.power !== current.power) {
    return next.power > current.power ? next : current
  }

  if (next.perkCount !== current.perkCount) {
    return next.perkCount > current.perkCount ? next : current
  }

  return next.level > current.level ? next : current
}

const RARITY_RANK: Record<SchematicRarity, number> = {
  c: 0,
  uc: 1,
  r: 2,
  vr: 3,
  sr: 4,
  ur: 5,
}

const PERK_VALUES: Record<string, [number, number, number, number, number, number]> = {
  damage: [10, 15, 20, 25, 30, 35],
  critdamage: [45, 68, 90, 113, 135, 157],
  critrating: [10, 15, 20, 25, 30, 35],
  firerate: [14, 21, 28, 35, 42, 49],
  magsize: [25, 38, 50, 63, 75, 87],
  reload: [25, 38, 50, 63, 75, 87],
  durability: [14, 21, 28, 35, 44, 52],
  headshot: [13, 20, 27, 33, 40, 47],
  mist: [6, 9, 12, 18, 24, 30],
  afflicted: [15, 22, 30, 38, 45, 52],
  element: [5, 10, 15, 20, 20, 20],
}

const SIXTH_PERK_TEXT: Array<{ test: RegExp; label: string }> = [
  {
    test: /chainlightning/,
    label: LAMP_PERK_TEXT,
  },
  {
    test: /affliction/,
    label: 'Causes Affliction damage for 6 seconds.',
  },
  {
    test: /snare/,
    label: 'Damage dealt with this weapon snares the target by 30% for 6 seconds.',
  },
  {
    test: /headshot.*explod|explod.*headshot/,
    label:
      'Headshot eliminations cause an explosion, damaging enemies within 0.5 tiles for 30% weapon damage.',
  },
  {
    test: /5headshot|headshotsinarow/,
    label:
      'Getting 5 headshots in a row increases ranged weapon damage +30% for 10 seconds.',
  },
]

export const PERK_PIP_COLOR: Record<SchematicRarity, string> = {
  c: 'bg-zinc-400',
  uc: 'bg-green-500',
  r: 'bg-blue-500',
  vr: 'bg-purple-500',
  sr: 'bg-yellow-400',
  ur: 'bg-yellow-400',
}

const TIER_TO_RARITY: Record<string, SchematicRarity> = {
  '1': 'c',
  '2': 'uc',
  '3': 'r',
  '4': 'vr',
  '5': 'sr',
  '6': 'ur',
}

function perkRarityFromId(id: string): SchematicRarity | null {
  const tier = id.match(/_t0?([1-6])$/i)

  if (tier?.[1] && TIER_TO_RARITY[tier[1]]) {
    return TIER_TO_RARITY[tier[1]]
  }

  const letter = id.match(/_(ur|sr|vr|uc|c|r)$/i)

  if (letter?.[1]) {
    return letter[1].toLowerCase() as SchematicRarity
  }

  return null
}

function perkValue(key: string, rarity: SchematicRarity | null) {
  const row = PERK_VALUES[key]

  if (!row) {
    return null
  }

  const rank = rarity ? RARITY_RANK[rarity] : 4

  return row[rank] ?? row[4]
}

function titleFromId(id: string) {
  const cleaned = id
    .replace(/^alteration:/i, '')
    .replace(/^aid_/i, '')
    .replace(/_(ur|sr|vr|uc|c|r)(?:_t0?[1-6])?$/i, '')
    .replace(/_t0?[1-6]$/i, '')
    .replace(/_/g, ' ')
    .trim()

  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatWeaponPerk(alteration: string): WeaponPerkRow {
  const id = alteration.toLowerCase().replace(/[^a-z0-9_:]/g, '')
  const compact = id.replace(/[^a-z0-9]/g, '')
  const sixth = SIXTH_PERK_TEXT.find((entry) => entry.test.test(compact))
  const rarity =
    perkRarityFromId(id.replace(/^alteration:/, '')) ?? (sixth ? 'sr' : null)
  const filled = rarity ? Math.min(5, RARITY_RANK[rarity] + 1) : 5

  if (sixth) {
    return {
      id: alteration,
      label: sixth.label,
      rarity,
      filled,
      isLamp: /chainlightning/.test(compact),
    }
  }

  let label = titleFromId(id)

  if (/ele_?nature|elementnature/.test(compact)) {
    const bonus = perkValue('element', rarity)
    label =
      bonus && bonus >= 20
        ? 'Element: Nature and +20% Damage'
        : `Element: Nature and +${bonus ?? 20}% Damage`
  } else if (/ele_?fire|elementfire/.test(compact)) {
    const bonus = perkValue('element', rarity)
    label = `Element: Fire and +${bonus ?? 20}% Damage`
  } else if (/ele_?water|elementwater/.test(compact)) {
    const bonus = perkValue('element', rarity)
    label = `Element: Water and +${bonus ?? 20}% Damage`
  } else if (/ele_?physical|elementphysical/.test(compact)) {
    const bonus = perkValue('element', rarity)
    label = `Element: Physical and +${bonus ?? 20}% Damage`
  } else if (/ele_?energy|elementenergy/.test(compact)) {
    const bonus = perkValue('element', rarity)
    label = `Element: Energy and +${bonus ?? 20}% Damage`
  } else if (/mistmonster/.test(compact)) {
    label = `+${perkValue('mist', rarity) ?? 24}% Damage to Mist Monsters`
  } else if (/afflicted|dmgaffliction|damageafflict/.test(compact)) {
    label = `+${perkValue('afflicted', rarity) ?? 45}% Damage to Afflicted`
  } else if (/critdamage|criticaldamage/.test(compact)) {
    label = `+${perkValue('critdamage', rarity) ?? 135}% Crit Damage`
  } else if (/critrating|critchance|criticalrating/.test(compact)) {
    label = `+${perkValue('critrating', rarity) ?? 30} Critical Rating`
  } else if (/firerate|attackspeed/.test(compact)) {
    label = `+${perkValue('firerate', rarity) ?? 42}% Fire Rate`
  } else if (/magsize|magazinesize|clipsize/.test(compact)) {
    label = `+${perkValue('magsize', rarity) ?? 75}% Magazine Size`
  } else if (/reload/.test(compact)) {
    label = `+${perkValue('reload', rarity) ?? 75}% Reload Speed`
  } else if (/headshot/.test(compact)) {
    label = `+${perkValue('headshot', rarity) ?? 40}% Headshot Damage`
  } else if (/durability/.test(compact)) {
    label = `+${perkValue('durability', rarity) ?? 44}% Durability`
  } else if (/(^|_)att_?damage|weapondamage/.test(compact) || /aidattdamage/.test(compact)) {
    label = `+${perkValue('damage', rarity) ?? 30}% Damage`
  }

  return {
    id: alteration,
    label,
    rarity,
    filled,
    isLamp: false,
  }
}

export function inspectPerks(alterations: Array<string>) {
  const rows = alterations.slice(0, 6).map((alteration) =>
    formatWeaponPerk(alteration)
  )
  const lamp = rows.find((row) => row.isLamp) ?? null
  const perks = rows.filter((row) => !row.isLamp)

  return { perks, lamp }
}

type CampaignItem = {
  templateId?: string
  attributes?: object | null
}

function itemLevel(attributes: Record<string, unknown>) {
  const levelRaw = attributes.level

  if (typeof levelRaw === 'number') {
    return levelRaw
  }

  if (typeof levelRaw === 'string') {
    return Number.parseInt(levelRaw, 10) || 0
  }

  return 0
}

/** One lamp schematic per daily-quest kind: highest power, same rule as the list. */
export function bestLampWeapons(items: Record<string, CampaignItem>) {
  const weapons = emptyKindMap()

  Object.entries(items).forEach(([itemId, item]) => {
    const templateId = item.templateId ?? ''
    const kind = classifyDqWeapon(templateId)

    if (!kind) {
      return
    }

    const attributes = (item.attributes ?? {}) as Record<string, unknown>
    const alterations = itemAlterations(attributes)

    if (!isLampWeapon(alterations)) {
      return
    }

    const level = itemLevel(attributes)
    const next: DqWeaponMatch = {
      kind,
      itemId,
      name: schematicDisplayName(templateId),
      templateId,
      perkCount: alterations.length,
      level,
      power: schematicPowerLevel(templateId, level),
      rarity: parseSchematicRarity(templateId),
      star: parseSchematicStar(templateId, level),
      alterations: alterations.slice(0, 6),
      alterationBaseRarities: itemAlterationBaseRarities(attributes),
      imageUrl: schematicIconUrl(templateId),
    }
    const current = weapons[kind]

    weapons[kind] = current ? pickBetterMatch(current, next) : next
  })

  return weapons
}

export function collectLampWeaponItemIds(items: Record<string, CampaignItem>) {
  return Object.values(bestLampWeapons(items))
    .filter((match): match is DqWeaponMatch => match !== null)
    .map((match) => match.itemId)
}
