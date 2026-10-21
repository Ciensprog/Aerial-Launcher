import { assets } from '../repository'

export type VentureRewardKind =
  | 'gold'
  | 'tickets'
  | 'llama'
  | 'rain'
  | 'lightning'
  | 'eye'
  | 'shard'
  | 'reperk'
  | 'core-reperk'
  | 'epic-perkup'
  | 'legendary-perkup'
  | 'flux'
  | 'weapon-voucher'
  | 'hero-voucher'
  | 'survivor-sc'
  | 'hero-sc'
  | 'trap-sc'
  | 'weapon-sc'

export type VentureReward = {
  level: number
  xp: number
  kind: VentureRewardKind
  name: string
  quantity: number
  imageUrl: string
}

export type VentureQuest = {
  itemId: string
  templateId: string
  category: string
  name: string
  state: 'active' | 'completed' | 'claimed' | 'locked'
  progress: number
  goal: number
}

export type VentureTrack = {
  level: number
  xp: number
  xpForLevel: number
  xpForNext: number
  rewards: Array<VentureReward & { claimed: boolean }>
  quests: Array<VentureQuest>
}

const XP_TO_LEVEL: Array<number> = [
  0, 0, 4550, 9625, 15225, 21700, 29075, 37350, 46550, 56700, 68175, 81000,
  95200, 110775, 128350, 147100, 166900, 187550, 209875, 233100, 257250,
  282275, 309325, 337500, 366750, 397100, 429900, 464025, 499475, 536275,
  576000, 617350, 660300, 704875, 753025, 803125, 855175, 909200, 967550,
  1028275, 1091375, 1156875, 1227575, 1301150, 1377550, 1456775, 1542350,
  1631400, 1723950, 1819950, 1919450,
]

const TRACK: Array<{
  level: number
  kind: VentureRewardKind
  name: string
  quantity: number
  asset: string
}> = [
  { level: 2, kind: 'gold', name: 'Seasonal Gold', quantity: 150, asset: 'campaign_event_currency' },
  { level: 3, kind: 'tickets', name: 'Tickets', quantity: 500, asset: 'eventcurrency_scaling' },
  { level: 4, kind: 'gold', name: 'Seasonal Gold', quantity: 200, asset: 'campaign_event_currency' },
  { level: 5, kind: 'llama', name: 'Jackpot Llama', quantity: 1, asset: 'voucher_cardpack_jackpot' },
  { level: 6, kind: 'gold', name: 'Seasonal Gold', quantity: 200, asset: 'campaign_event_currency' },
  { level: 7, kind: 'rain', name: 'Pure Drop of Rain', quantity: 25, asset: 'reagent_c_t01' },
  { level: 8, kind: 'gold', name: 'Seasonal Gold', quantity: 250, asset: 'campaign_event_currency' },
  { level: 9, kind: 'rain', name: 'Pure Drop of Rain', quantity: 40, asset: 'reagent_c_t01' },
  { level: 10, kind: 'llama', name: 'Jackpot Llama', quantity: 1, asset: 'voucher_cardpack_jackpot' },
  { level: 11, kind: 'reperk', name: 'RE-PERK!', quantity: 180, asset: 'reagent_alteration_generic' },
  { level: 12, kind: 'gold', name: 'Seasonal Gold', quantity: 250, asset: 'campaign_event_currency' },
  { level: 13, kind: 'weapon-voucher', name: 'Weapon Voucher', quantity: 1, asset: 'voucher_item_buyback' },
  { level: 14, kind: 'rain', name: 'Pure Drop of Rain', quantity: 50, asset: 'reagent_c_t01' },
  { level: 15, kind: 'lightning', name: 'Lightning in a Bottle', quantity: 35, asset: 'reagent_c_t02' },
  { level: 16, kind: 'flux', name: 'Legendary Flux', quantity: 100, asset: 'reagent_evolverarity_sr' },
  { level: 17, kind: 'core-reperk', name: 'Core RE-PERK!', quantity: 1, asset: 'reagent_alteration_gameplay_generic' },
  { level: 18, kind: 'epic-perkup', name: 'Epic PERK-UP!', quantity: 225, asset: 'reagent_alteration_upgrade_vr' },
  { level: 19, kind: 'reperk', name: 'RE-PERK!', quantity: 300, asset: 'reagent_alteration_generic' },
  { level: 20, kind: 'hero-voucher', name: 'Hero Voucher', quantity: 1, asset: 'voucher_herobuyback' },
  { level: 21, kind: 'gold', name: 'Seasonal Gold', quantity: 500, asset: 'campaign_event_currency' },
  { level: 22, kind: 'flux', name: 'Legendary Flux', quantity: 100, asset: 'reagent_evolverarity_sr' },
  { level: 23, kind: 'epic-perkup', name: 'Epic PERK-UP!', quantity: 325, asset: 'reagent_alteration_upgrade_vr' },
  { level: 24, kind: 'reperk', name: 'RE-PERK!', quantity: 450, asset: 'reagent_alteration_generic' },
  { level: 25, kind: 'survivor-sc', name: 'Survivor Supercharger', quantity: 1, asset: 'reagent_promotion_survivors' },
  { level: 26, kind: 'reperk', name: 'RE-PERK!', quantity: 600, asset: 'reagent_alteration_generic' },
  { level: 27, kind: 'rain', name: 'Pure Drop of Rain', quantity: 100, asset: 'reagent_c_t01' },
  { level: 28, kind: 'trap-sc', name: 'Trap Supercharger', quantity: 1, asset: 'reagent_promotion_traps' },
  { level: 29, kind: 'lightning', name: 'Lightning in a Bottle', quantity: 60, asset: 'reagent_c_t02' },
  { level: 30, kind: 'gold', name: 'Seasonal Gold', quantity: 500, asset: 'campaign_event_currency' },
  { level: 31, kind: 'survivor-sc', name: 'Survivor Supercharger', quantity: 2, asset: 'reagent_promotion_survivors' },
  { level: 32, kind: 'eye', name: 'Eye of the Storm', quantity: 40, asset: 'reagent_c_t03' },
  { level: 33, kind: 'legendary-perkup', name: 'Legendary PERK-UP!', quantity: 450, asset: 'reagent_alteration_upgrade_sr' },
  { level: 34, kind: 'hero-sc', name: 'Hero Supercharger', quantity: 1, asset: 'reagent_promotion_heroes' },
  { level: 35, kind: 'gold', name: 'Seasonal Gold', quantity: 500, asset: 'campaign_event_currency' },
  { level: 36, kind: 'rain', name: 'Pure Drop of Rain', quantity: 130, asset: 'reagent_c_t01' },
  { level: 37, kind: 'survivor-sc', name: 'Survivor Supercharger', quantity: 3, asset: 'reagent_promotion_survivors' },
  { level: 38, kind: 'reperk', name: 'RE-PERK!', quantity: 600, asset: 'reagent_alteration_generic' },
  { level: 39, kind: 'lightning', name: 'Lightning in a Bottle', quantity: 90, asset: 'reagent_c_t02' },
  { level: 40, kind: 'weapon-sc', name: 'Weapon Supercharger', quantity: 1, asset: 'reagent_promotion_weapons' },
  { level: 41, kind: 'eye', name: 'Eye of the Storm', quantity: 60, asset: 'reagent_c_t03' },
  { level: 42, kind: 'survivor-sc', name: 'Survivor Supercharger', quantity: 4, asset: 'reagent_promotion_survivors' },
  { level: 43, kind: 'shard', name: 'Storm Shard', quantity: 30, asset: 'reagent_c_t04' },
  { level: 44, kind: 'hero-sc', name: 'Hero Supercharger', quantity: 1, asset: 'reagent_promotion_heroes' },
  { level: 45, kind: 'reperk', name: 'RE-PERK!', quantity: 1200, asset: 'reagent_alteration_generic' },
  { level: 46, kind: 'survivor-sc', name: 'Survivor Supercharger', quantity: 5, asset: 'reagent_promotion_survivors' },
  { level: 47, kind: 'legendary-perkup', name: 'Legendary PERK-UP!', quantity: 600, asset: 'reagent_alteration_upgrade_sr' },
  { level: 48, kind: 'trap-sc', name: 'Trap Supercharger', quantity: 1, asset: 'reagent_promotion_traps' },
  { level: 49, kind: 'hero-sc', name: 'Hero Supercharger', quantity: 1, asset: 'reagent_promotion_heroes' },
  { level: 50, kind: 'weapon-sc', name: 'Weapon Supercharger', quantity: 1, asset: 'reagent_promotion_weapons' },
]

const REPEATABLE: Array<{
  kind: VentureRewardKind
  name: string
  quantity: number
  asset: string
}> = [
  { kind: 'reperk', name: 'RE-PERK!', quantity: 1200, asset: 'reagent_alteration_generic' },
  { kind: 'rain', name: 'Pure Drop of Rain', quantity: 140, asset: 'reagent_c_t01' },
  { kind: 'gold', name: 'Seasonal Gold', quantity: 650, asset: 'campaign_event_currency' },
  { kind: 'lightning', name: 'Lightning in a Bottle', quantity: 100, asset: 'reagent_c_t02' },
  { kind: 'epic-perkup', name: 'Epic PERK-UP!', quantity: 750, asset: 'reagent_alteration_upgrade_vr' },
  { kind: 'eye', name: 'Eye of the Storm', quantity: 80, asset: 'reagent_c_t03' },
  { kind: 'reperk', name: 'RE-PERK!', quantity: 1200, asset: 'reagent_alteration_generic' },
  { kind: 'shard', name: 'Storm Shard', quantity: 50, asset: 'reagent_c_t04' },
  { kind: 'gold', name: 'Seasonal Gold', quantity: 650, asset: 'campaign_event_currency' },
  { kind: 'legendary-perkup', name: 'Legendary PERK-UP!', quantity: 600, asset: 'reagent_alteration_upgrade_sr' },
]

const QUEST_MAX: Record<string, Array<number>> = {
  destroy: [25, 25, 20, 20, 20, 5, 15, 5, 20, 10, 5, 5],
  locating: [1, 10, 6, 20, 1, 10, 20, 40, 9, 20, 60, 1],
  mission: [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  monster: [300, 100, 50, 15, 10, 60, 100, 10, 15, 100, 20, 1],
  weapon: [300, 200, 150, 100, 150, 75, 50, 50, 100, 150, 250, 50],
}

const CATEGORY_LABEL: Record<string, string> = {
  destroy: 'Destroy',
  locating: 'Locating',
  mission: 'Mission',
  monster: 'Eliminate',
  weapon: 'Weapons',
  other: 'Other',
}

function xpRequiredFor(level: number) {
  if (level <= 50) {
    return XP_TO_LEVEL[level] ?? 0
  }

  let xp = XP_TO_LEVEL[50]
  let step = 103000

  for (let current = 51; current <= level; current += 1) {
    xp += step
    step += 3500
  }

  return xp
}

export function ventureLevelFromXp(xp: number) {
  const safe = Math.max(0, xp)
  let level = 1

  while (xpRequiredFor(level + 1) <= safe) {
    level += 1

    if (level >= 500) {
      break
    }
  }

  return level
}

function rewardImage(asset: string) {
  return assets(asset) || assets('question') || ''
}

function rewardForLevel(level: number): Omit<VentureReward, 'level' | 'xp'> | null {
  if (level <= 1) {
    return null
  }

  if (level <= 50) {
    const row = TRACK.find((entry) => entry.level === level)

    if (!row) {
      return null
    }

    return {
      kind: row.kind,
      name: row.name,
      quantity: row.quantity,
      imageUrl: rewardImage(row.asset),
    }
  }

  const row = REPEATABLE[(level - 51) % REPEATABLE.length] ?? REPEATABLE[0]

  return {
    kind: row.kind,
    name: row.name,
    quantity: row.quantity,
    imageUrl: rewardImage(row.asset),
  }
}

function extractPhoenixXp(items: Record<string, { templateId?: string; quantity?: number }>) {
  let xp = 0

  Object.values(items).forEach((item) => {
    const id = `${item.templateId ?? ''}`.toLowerCase()

    if (id === 'accountresource:phoenixxp' || id === 'accountresource:phoenixxp_reward') {
      xp = Math.max(xp, item.quantity ?? 0)
    }
  })

  return xp
}

function isVentureQuest(templateId: string) {
  const lower = templateId.toLowerCase()

  return (
    lower.includes('_seasonal_') ||
    lower.includes('phoenixquest') ||
    lower.includes('seasonalquest')
  )
}

function questCategory(templateId: string) {
  const body = templateId.replace(/^Quest:/i, '').toLowerCase()
  const match = body.match(/(destroy|locating|mission|monster|weapon)_(\d+)/)

  if (match?.[1]) {
    return match[1]
  }

  return 'other'
}

function questIndex(templateId: string) {
  const match = templateId.toLowerCase().match(/_(destroy|locating|mission|monster|weapon)_(\d+)/)

  return match?.[2] ? Number.parseInt(match[2], 10) : 0
}

function questName(templateId: string) {
  const body = templateId.replace(/^Quest:/i, '')
  const lower = body.toLowerCase()

  if (lower.includes('phoenixquest_tutorial')) {
    return 'Welcome to Ventures'
  }

  const category = questCategory(templateId)
  const index = questIndex(templateId)
  const label = CATEGORY_LABEL[category] ?? 'Quest'

  if (index > 0) {
    return `${label} ${String(index).padStart(2, '0')}`
  }

  return body
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function questGoal(templateId: string) {
  const category = questCategory(templateId)
  const index = questIndex(templateId)
  const max = QUEST_MAX[category]

  if (max && index >= 1 && index <= max.length) {
    return max[index - 1]
  }

  return 1
}

function questProgress(attributes: Record<string, unknown>) {
  return Object.entries(attributes)
    .filter(([key, value]) => key.startsWith('completion_') && typeof value === 'number')
    .reduce((sum, [, value]) => sum + (value as number), 0)
}

function questState(raw: unknown): VentureQuest['state'] {
  const state = `${raw ?? ''}`.toLowerCase()

  if (state === 'active') {
    return 'active'
  }

  if (state === 'claimed') {
    return 'claimed'
  }

  if (state === 'completed') {
    return 'completed'
  }

  return 'locked'
}

export function emptyVentureTrack(): VentureTrack {
  return {
    level: 1,
    xp: 0,
    xpForLevel: 0,
    xpForNext: XP_TO_LEVEL[2],
    rewards: TRACK.map((row) => ({
      level: row.level,
      xp: XP_TO_LEVEL[row.level] ?? 0,
      kind: row.kind,
      name: row.name,
      quantity: row.quantity,
      imageUrl: rewardImage(row.asset),
      claimed: false,
    })),
    quests: [],
  }
}

export function parseVentureTrack(
  items: Record<string, unknown> | undefined
): VentureTrack {
  const profileItems = (items ?? {}) as Record<
    string,
    { templateId?: string; quantity?: number; attributes?: Record<string, unknown> }
  >
  const xp = extractPhoenixXp(profileItems)
  const level = ventureLevelFromXp(xp)
  const xpForLevel = xpRequiredFor(level)
  const xpForNext = xpRequiredFor(level + 1)
  const lastTrack = Math.max(50, Math.min(level + 10, 80))
  const rewards: Array<VentureReward & { claimed: boolean }> = []

  for (let rewardLevel = 2; rewardLevel <= lastTrack; rewardLevel += 1) {
    const reward = rewardForLevel(rewardLevel)

    if (!reward) {
      continue
    }

    rewards.push({
      level: rewardLevel,
      xp: xpRequiredFor(rewardLevel),
      ...reward,
      claimed: level >= rewardLevel,
    })
  }

  const quests: Array<VentureQuest> = []

  Object.entries(profileItems).forEach(([itemId, item]) => {
    const templateId = item.templateId ?? ''

    if (!templateId.toLowerCase().startsWith('quest:') || !isVentureQuest(templateId)) {
      return
    }

    const attributes = item.attributes ?? {}
    const progress = questProgress(attributes)

    quests.push({
      itemId,
      templateId,
      category: questCategory(templateId),
      name: questName(templateId),
      state: questState(attributes.quest_state),
      progress,
      goal: Math.max(questGoal(templateId), progress || 0) || 1,
    })
  })

  const categoryOrder = ['destroy', 'locating', 'mission', 'monster', 'weapon', 'other']

  quests.sort((left, right) => {
    const stateRank = (state: VentureQuest['state']) => {
      if (state === 'active') {
        return 0
      }

      if (state === 'completed') {
        return 1
      }

      if (state === 'claimed') {
        return 2
      }

      return 3
    }

    const state = stateRank(left.state) - stateRank(right.state)

    if (state !== 0) {
      return state
    }

    const category =
      categoryOrder.indexOf(left.category) - categoryOrder.indexOf(right.category)

    if (category !== 0) {
      return category
    }

    return questIndex(left.templateId) - questIndex(right.templateId)
  })

  return {
    level,
    xp,
    xpForLevel,
    xpForNext,
    rewards,
    quests,
  }
}

export { CATEGORY_LABEL }
