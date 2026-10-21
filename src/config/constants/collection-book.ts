import type { CollectionBookSectionId } from '../../types/collection-book'
import { RarityType } from './resources'
import { lookupStwItem } from '../../lib/stw/display-names'

/** Base max level by star tier (before max_level_bonus / supercharge). */
export const STAR_MAX_LEVEL: Record<number, number> = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
  6: 60,
}

export const RARITY_ORDER = ['c', 'uc', 'r', 'vr', 'sr', 'ur']

type NavChild = {
  id: CollectionBookSectionId
  labelKey: string
}

export type CollectionBookNavGroup = {
  id: string
  labelKey: string
  children?: Array<NavChild>
}

export const COLLECTION_BOOK_NAV: Array<CollectionBookNavGroup> = [
  {
    id: 'heroes',
    labelKey: 'heroes',
    children: [
      { id: 'heroes-soldiers', labelKey: 'heroes-soldiers' },
      { id: 'heroes-constructors', labelKey: 'heroes-constructors' },
      { id: 'heroes-ninjas', labelKey: 'heroes-ninjas' },
      { id: 'heroes-outlanders', labelKey: 'heroes-outlanders' },
    ],
  },
  {
    id: 'personnel',
    labelKey: 'personnel',
    children: [
      { id: 'personnel-defenders', labelKey: 'personnel-defenders' },
      { id: 'personnel-survivors', labelKey: 'personnel-survivors' },
      { id: 'personnel-leads', labelKey: 'personnel-leads' },
    ],
  },
  {
    id: 'ranged',
    labelKey: 'ranged',
    children: [
      { id: 'ranged-assault', labelKey: 'ranged-assault' },
      { id: 'ranged-shotgun', labelKey: 'ranged-shotgun' },
      { id: 'ranged-sniper', labelKey: 'ranged-sniper' },
      { id: 'ranged-pistol', labelKey: 'ranged-pistol' },
      { id: 'ranged-explosive', labelKey: 'ranged-explosive' },
    ],
  },
  {
    id: 'melee',
    labelKey: 'melee',
    children: [
      { id: 'melee-sword', labelKey: 'melee-sword' },
      { id: 'melee-axe', labelKey: 'melee-axe' },
      { id: 'melee-scythe', labelKey: 'melee-scythe' },
      { id: 'melee-spear', labelKey: 'melee-spear' },
      { id: 'melee-hardware', labelKey: 'melee-hardware' },
    ],
  },
  {
    id: 'traps',
    labelKey: 'traps',
    children: [
      { id: 'traps-wall', labelKey: 'traps-wall' },
      { id: 'traps-ceiling', labelKey: 'traps-ceiling' },
      { id: 'traps-floor', labelKey: 'traps-floor' },
    ],
  },
  { id: 'starter-packs', labelKey: 'starter-packs' },
  { id: 'event-people', labelKey: 'event-people' },
  { id: 'event-schematics', labelKey: 'event-schematics' },
  { id: 'expansion-people', labelKey: 'expansion-people' },
  { id: 'expansion-schematics', labelKey: 'expansion-schematics' },
  { id: 'other', labelKey: 'other' },
]

const SECTION_IDS = new Set<string>(
  COLLECTION_BOOK_NAV.flatMap((group) =>
    group.children?.length ? group.children.map((child) => child.id) : [group.id],
  ),
)

export function isCollectionBookSection(
  value: string,
): value is CollectionBookSectionId {
  return SECTION_IDS.has(value)
}

export function sectionIdsFor(target: string): Array<CollectionBookSectionId> | null {
  if (!target || target === 'all') {
    return null
  }

  const group = COLLECTION_BOOK_NAV.find((entry) => entry.id === target)

  if (group?.children?.length) {
    return group.children.map((child) => child.id)
  }

  if (isCollectionBookSection(target)) {
    return [target]
  }

  return []
}

export function parseStarTier(templateId: string): number {
  const tierMatch = templateId.match(/_t0([1-6])(?:_|$)/i)
  if (tierMatch) {
    return Number(tierMatch[1])
  }

  if (templateId.endsWith('_ur') || templateId.includes('_ur_')) {
    return 5
  }
  if (templateId.endsWith('_sr') || templateId.includes('_sr_')) {
    return 5
  }
  if (templateId.endsWith('_vr') || templateId.includes('_vr_')) {
    return 4
  }
  if (templateId.endsWith('_r') || templateId.includes('_r_')) {
    return 3
  }
  if (templateId.endsWith('_uc') || templateId.includes('_uc_')) {
    return 2
  }

  return 1
}

export function getMaxLevelForItem(
  templateId: string,
  maxLevelBonus = 0,
): number {
  const stars = parseStarTier(templateId)
  const base = STAR_MAX_LEVEL[stars] ?? 50

  return base + Math.max(0, maxLevelBonus)
}

export function rarityToken(templateId: string) {
  const id = templateId.toLowerCase()

  if (/(^|_)ur(_|$)/.test(id)) return 'ur'
  if (/(^|_)sr(_|$)/.test(id)) return 'sr'
  if (/(^|_)vr(_|$)/.test(id)) return 'vr'
  if (/(^|_)r(_|$)/.test(id)) return 'r'
  if (/(^|_)uc(_|$)/.test(id)) return 'uc'

  return 'c'
}

/** Highest star this rarity can reach. Epic stops at 4. */
export function rarityMaxStar(templateId: string) {
  const token = rarityToken(templateId)

  if (token === 'sr' || token === 'ur') return 5
  if (token === 'vr') return 4
  if (token === 'r') return 3
  if (token === 'uc') return 2

  return 1
}

/** Full upgrade cap, including superchargers on the last star. */
export function levelCeiling(templateId: string, maxLevelBonus = 0) {
  const star = rarityMaxStar(templateId)
  const base = STAR_MAX_LEVEL[star] ?? 50

  return base + Math.max(0, maxLevelBonus)
}

/**
 * Cap of the current evolution. Supercharger bonus applies only on the last star,
 * so a 1-star legendary still stops at 10 until it is evolved.
 */
export function evolutionCap(
  star: number,
  rarityStar: number,
  maxLevelBonus = 0,
) {
  const base = STAR_MAX_LEVEL[star] ?? 50

  if (star >= rarityStar) {
    return base + Math.max(0, maxLevelBonus)
  }

  return base
}

export function rarityFromTemplate(templateId: string): RarityType {
  const id = templateId.toLowerCase()

  if (/(^|_)ur(_|$)/.test(id)) return RarityType.Mythic
  if (/(^|_)sr(_|$)/.test(id)) return RarityType.Legendary
  if (/(^|_)vr(_|$)/.test(id)) return RarityType.Epic
  if (/(^|_)r(_|$)/.test(id)) return RarityType.Rare
  if (/(^|_)uc(_|$)/.test(id)) return RarityType.Uncommon

  return RarityType.Common
}

const EVENT_TOKENS = [
  'halloween',
  'holiday',
  'birthday',
  'bday',
  'pirate',
  'hydra',
  'winter',
  'candy',
  'toy',
  'medieval',
  'boombox',
  'stormking',
  'spy',
  'chinese',
  'easter',
  'love',
  'wukong',
  'fortnitemares',
  'roadtrip',
  'blockbuster',
  'wildwest',
  'steelwool',
  'dino',
  'dinosaur',
  'crackshot',
  'snow',
  'frost',
  'ginger',
  'lunar',
  'spring',
  'summer',
  'ornament',
  'fourthofjuly',
  '4thjuly',
]

const EXPANSION_TOKENS = [
  'vacuumtube',
  'neon',
  'dragon',
  'ratrod',
  'retroscifi',
  'retro',
  'scavenger',
  'military',
  'blackmetal',
  'flintlock',
  'steampunk',
  'hydraulic',
  'laser',
  'raygun',
]

function hasToken(id: string, tokens: Array<string>) {
  return tokens.some((token) => id.includes(token))
}

export function classifySection(templateId: string): CollectionBookSectionId {
  const id = templateId.toLowerCase()

  if (id.startsWith('hero:') || id.includes('hid_')) {
    if (id.includes('founders')) return 'starter-packs'
    if (id.includes('constructor')) return 'heroes-constructors'
    if (id.includes('ninja')) return 'heroes-ninjas'
    if (id.includes('outlander')) return 'heroes-outlanders'
    return 'heroes-soldiers'
  }

  if (id.startsWith('defender:') || id.includes('defender')) {
    return 'personnel-defenders'
  }

  if (id.startsWith('worker:') || id.includes('manager') || id.includes('worker')) {
    if (id.includes('manager')) return 'personnel-leads'
    if (hasToken(id, EVENT_TOKENS)) return 'event-people'
    return 'personnel-survivors'
  }

  if (id.includes('founders')) return 'starter-packs'
  if (hasToken(id, EXPANSION_TOKENS)) return 'expansion-schematics'
  if (hasToken(id, EVENT_TOKENS)) return 'event-schematics'

  if (id.includes('ceiling')) return 'traps-ceiling'
  if (id.includes('floor')) return 'traps-floor'
  if (id.includes('wall')) return 'traps-wall'
  if (id.includes('trap')) return 'traps-floor'

  if (id.includes('sword')) return 'melee-sword'
  if (id.includes('axe')) return 'melee-axe'
  if (id.includes('scythe')) return 'melee-scythe'
  if (id.includes('spear')) return 'melee-spear'
  if (
    id.includes('club') ||
    id.includes('hardware') ||
    id.includes('hammer') ||
    id.includes('tool') ||
    id.includes('knife')
  ) {
    return 'melee-hardware'
  }
  if (id.includes('shotgun')) return 'ranged-shotgun'
  if (id.includes('sniper') || id.includes('bow') || id.includes('crossbow')) {
    return 'ranged-sniper'
  }
  if (
    id.includes('pistol') ||
    id.includes('revolver') ||
    id.includes('handcannon')
  ) {
    return 'ranged-pistol'
  }
  if (
    id.includes('launcher') ||
    id.includes('explosive') ||
    id.includes('grenade') ||
    id.includes('rocket')
  ) {
    return 'ranged-explosive'
  }
  if (id.includes('assault') || id.includes('rifle')) return 'ranged-assault'
  if (id.includes('edged') || id.includes('melee')) return 'melee-sword'

  return 'other'
}

export function sectionForTemplate(templateId: string): CollectionBookSectionId {
  const page = lookupStwItem(templateId)?.p

  if (page && isCollectionBookSection(page)) {
    return page
  }

  return classifySection(templateId)
}
