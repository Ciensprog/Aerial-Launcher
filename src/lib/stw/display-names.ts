import names from '../../data/stw-display-names.json'

export type StwNameKind = 'h' | 'w' | 't' | 's' | 'l' | 'd'

export type StwNameEntry = {
  n: string
  p: string
  k: StwNameKind
}

const CATALOG = names as Record<string, StwNameEntry>

const RARITY = new Set(['c', 'uc', 'r', 'vr', 'sr', 'ur', 'er'])

/** Stable id without prefix, tier, or defender gender. Rarity and ore/crystal stay. */
export function itemCardKey(templateId: string) {
  let id = templateId.toLowerCase().trim()
  const colon = id.indexOf(':')

  if (colon >= 0) {
    id = id.slice(colon + 1)
  }

  id = id.replace(/^(hid|sid|wid|tid|did|id)_/, '')
  id = id.replace(/^ob_/, '')
  id = id.replace(/_t0?[1-6]$/, '')

  if (id.includes('defender')) {
    id = id
      .split('_')
      .filter((part) => part && part !== 'm' && part !== 'f')
      .join('_')
  }

  return id
}

/**
 * Catalog key for this template. Gender is dropped only when the exact id is
 * missing and the ungendered id is a real entry, so Hawk/Wildcat stay apart
 * while Pathfinder Jess still matches a `_f_` copy.
 */
export function resolvedCardKey(templateId: string) {
  const key = itemCardKey(templateId)

  if (CATALOG[key]) {
    return key
  }

  const stripped = key
    .split('_')
    .filter((part) => part !== 'm' && part !== 'f')
    .join('_')

  if (stripped !== key && CATALOG[stripped]) {
    return stripped
  }

  return key
}

export function lookupStwItem(templateId: string) {
  return CATALOG[resolvedCardKey(templateId)]
}

export function stwCatalogEntries() {
  return Object.entries(CATALOG) as Array<[string, StwNameEntry]>
}

/** In-game display name. Empty when the catalog has no real name. */
export function gameItemName(templateId: string) {
  const entry = lookupStwItem(templateId)

  if (!entry?.n) {
    return ''
  }

  if (entry.k === 'd' && entry.n.toLowerCase() === 'defender') {
    return ''
  }

  return entry.n
}
