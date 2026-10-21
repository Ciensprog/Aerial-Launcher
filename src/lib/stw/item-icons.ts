import assetNames from '../../data/stw-asset-tokens.json'

const MIADSC = 'https://api.miadsc.xyz/assets/stw'

const TOKENS = assetNames.tokens as Record<string, string>
const OVERRIDES = assetNames.overrides as Record<string, string>

const UPPER = new Set([
  'hid',
  'sid',
  'tid',
  'did',
  'wid',
  'c',
  'uc',
  'r',
  'vr',
  'sr',
  'ur',
  'er',
  'alt',
])

const HERO_CLASS: Record<string, string> = {
  ninja: 'Ninja',
  constructor: 'Constructor',
  outlander: 'Outlander',
  commando: 'Soldier',
}

const LEAD_JOBS: Record<string, string> = {
  managerdoctor: 'Doctor',
  managerengineer: 'Engineer',
  managerexplorer: 'Explorer',
  managergadgeteer: 'Gadgeteer',
  managerinventor: 'Inventor',
  managermartialartist: 'Martial Artist',
  managersoldier: 'Marksman',
  managertrainer: 'Trainer',
}

const DEFENDER_KINDS: Array<[string, string]> = [
  ['defenderassault', 'Assault Defender'],
  ['defendermelee', 'Melee Defender'],
  ['defenderpistol', 'Pistol Defender'],
  ['defendershotgun', 'Shotgun Defender'],
  ['defendersniper', 'Sniper Defender'],
]

const SKIP_HERO = /^(m|f|v\d+|t\d+|c|uc|r|vr|sr|ur|er)$/

export function epicAssetFileName(rawId: string) {
  const lower = rawId.toLowerCase()
  const override = OVERRIDES[lower]

  if (override) {
    return override
  }

  return lower
    .split('_')
    .map((part) => {
      if (!part) {
        return part
      }

      if (UPPER.has(part) || /^t\d+$/.test(part)) {
        return part.toUpperCase()
      }

      if (part === 'ore') {
        return 'Ore'
      }

      if (part === 'crystal') {
        return 'Crystal'
      }

      return TOKENS[part] ?? part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join('_')
}

function bodyId(templateId: string) {
  const colon = templateId.indexOf(':')

  return (colon >= 0 ? templateId.slice(colon + 1) : templateId).toLowerCase()
}

export function itemIconUrl(templateId: string) {
  const colon = templateId.indexOf(':')
  const type = colon >= 0 ? templateId.slice(0, colon).toLowerCase() : ''
  const id = bodyId(templateId)

  if (type === 'hero' || id.startsWith('hid_')) {
    return `${MIADSC}/heroes/${epicAssetFileName(id)}.png`
  }

  if (
    type === 'worker' ||
    id.startsWith('worker') ||
    id.startsWith('manager')
  ) {
    return `${MIADSC}/survivors/${epicAssetFileName(id)}.png`
  }

  return null
}

function prettyToken(token: string) {
  const raw =
    TOKENS[token] ??
    (token ? token.charAt(0).toUpperCase() + token.slice(1) : token)

  return raw
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
}

export function heroItemName(templateId: string, rarityLabel: string) {
  const id = bodyId(templateId)
    .replace(/^hid_/, '')
    .replace(/_(c|uc|r|vr|sr|ur|er)(?:_t\d+)?$/i, '')
  const parts = id.split('_').filter(Boolean)
  const classToken = parts.shift() ?? ''
  const classLabel = HERO_CLASS[classToken] ?? prettyToken(classToken)
  const rest = parts
    .filter((part) => !SKIP_HERO.test(part))
    .map((part) => prettyToken(part))
    .join(' ')
  const label = [classLabel, rest].filter(Boolean).join(' ')

  return `${rarityLabel} ${label}`.trim()
}

export function leadPersonName(templateId: string) {
  const id = bodyId(templateId)

  if (!id.startsWith('manager')) {
    return ''
  }

  const jobs = new Set(Object.keys(LEAD_JOBS))
  const person = id
    .split('_')
    .filter((part) => part && !/^(c|uc|r|vr|sr|ur|er|t\d+)$/.test(part))
    .filter((part) => !jobs.has(part))
    .pop()

  if (!person) {
    return ''
  }

  const cased = TOKENS[person] ?? person

  return cased.charAt(0).toUpperCase() + cased.slice(1)
}

export function survivorItemName(templateId: string, rarityLabel: string) {
  const id = bodyId(templateId)

  if (id.startsWith('manager')) {
    const person = leadPersonName(id)

    if (person) {
      return `${rarityLabel} ${person}`
    }

    const jobKey = Object.keys(LEAD_JOBS).find((job) => id.startsWith(job))
    const job = jobKey ? LEAD_JOBS[jobKey] : 'Lead'

    return `${rarityLabel} ${job} Lead`
  }

  const set = id.match(/^worker([a-z]+)/)?.[1] ?? ''

  if (set && set !== 'basic') {
    return `${rarityLabel} ${set.charAt(0).toUpperCase()}${set.slice(1)} Survivor`
  }

  return `${rarityLabel} Survivor`
}

/** Name you can tell apart when the catalog has no entry. No rarity prefix. */
export function distinctHeroName(templateId: string) {
  const id = bodyId(templateId)
    .replace(/^hid_/, '')
    .replace(/_(c|uc|r|vr|sr|ur|er)(?:_t\d+)?$/i, '')
  const parts = id.split('_').filter(Boolean)
  parts.shift()
  const rest = parts
    .filter((part) => !SKIP_HERO.test(part) && !/^\d+$/.test(part))
    .map((part) => prettyToken(part))
    .join(' ')

  if (rest) {
    return rest
  }

  const classToken = bodyId(templateId).replace(/^hid_/, '').split('_')[0] ?? ''

  return HERO_CLASS[classToken] ?? 'Hero'
}

export function plainHeroName(templateId: string, rarityLabel: string) {
  const id = bodyId(templateId).replace(/^hid_/, '')
  const classToken = id.split('_').filter(Boolean)[0] ?? ''
  const classLabel = HERO_CLASS[classToken] ?? 'Hero'

  return `${rarityLabel} ${classLabel}`.trim()
}

export function defenderItemName(templateId: string, rarityLabel: string) {
  const id = bodyId(templateId)
  const founders = id.includes('founders') ? 'Founders ' : ''
  const kind =
    DEFENDER_KINDS.find(([token]) => id.includes(token))?.[1] ?? 'Defender'

  return `${rarityLabel} ${founders}${kind}`
}
