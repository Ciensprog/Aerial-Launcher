export type CostKind =
  | 'hero'
  | 'defender'
  | 'survivor'
  | 'lead'
  | 'weapon'
  | 'trap'

export type UpgradeSpend = {
  peopleXp: number
  schematicXp: number
  rain: number
  lightning: number
  eye: number
  shard: number
  trainingManuals: number
  schematicManuals: number
  heroSupercharger: number
  survivorSupercharger: number
  weaponSupercharger: number
  trapSupercharger: number
}

type RarityCode = 'c' | 'uc' | 'r' | 'vr' | 'sr' | 'ur'

type EvoCost = {
  xp: number
  rain: number
  lightning: number
  eye: number
  shard: number
  manuals: number
}

const EMPTY_SPEND = (): UpgradeSpend => ({
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
})

function evo(
  rarities: Array<RarityCode>,
  xp: Array<number>,
  rain: Array<number>,
  manuals: Array<number>,
  lightning: Array<number> = [],
  eye: Array<number> = [],
  shard: Array<number> = [],
): Partial<Record<RarityCode, EvoCost>> {
  const table: Partial<Record<RarityCode, EvoCost>> = {}

  rarities.forEach((rarity, index) => {
    table[rarity] = {
      xp: xp[index] ?? 0,
      rain: rain[index] ?? 0,
      lightning: lightning[index] ?? 0,
      eye: eye[index] ?? 0,
      shard: shard[index] ?? 0,
      manuals: manuals[index] ?? 0,
    }
  })

  return table
}

/**
 * Evolution packages from the archived Fortnite wiki Upgrade page
 * (Heroes/Weapons/Traps, Subordinate Survivors, Lead Survivors, Defenders).
 * Level XP is separate: BASE * (to*(to-1) - from*(from-1)) / 2.
 * A gate at 10/20/30/40 is the 2/3/4/5-star evolution.
 */
const HERO_WEAPON_TRAP: Record<number, Partial<Record<RarityCode, EvoCost>>> = {
  2: evo(
    ['c', 'uc', 'r', 'vr', 'sr', 'ur'],
    [500, 1000, 1500, 2000, 2500, 2500],
    [5, 7, 10, 15, 20, 20],
    [0, 0, 1, 2, 3, 3],
  ),
  3: evo(
    ['uc', 'r', 'vr', 'sr', 'ur'],
    [2500, 3750, 5000, 6250, 6250],
    [14, 20, 30, 40, 40],
    [1, 3, 5, 8, 8],
    [5, 7, 9, 11, 11],
  ),
  4: evo(
    ['r', 'vr', 'sr', 'ur'],
    [6000, 8000, 10000, 10000],
    [30, 45, 60, 60],
    [6, 9, 13, 13],
    [14, 18, 22, 22],
    [7, 9, 11, 11],
  ),
  5: evo(
    ['vr', 'sr', 'ur'],
    [11000, 13750, 13750],
    [60, 80, 80],
    [12, 18, 18],
    [27, 33, 33],
    [18, 22, 22],
    [9, 11, 11],
  ),
}

const SURVIVOR: Record<number, Partial<Record<RarityCode, EvoCost>>> = {
  2: evo(
    ['c', 'uc', 'r', 'vr', 'sr', 'ur'],
    [500, 1000, 1500, 2000, 2500, 7500],
    [3, 4, 6, 8, 10, 12],
    [0, 0, 1, 2, 3, 4],
  ),
  3: evo(
    ['uc', 'r', 'vr', 'sr', 'ur'],
    [2500, 3750, 5000, 6250, 7500],
    [8, 12, 16, 20, 24],
    [1, 3, 5, 8, 10],
    [3, 4, 6, 8, 10],
  ),
  4: evo(
    ['r', 'vr', 'sr', 'ur'],
    [6000, 8000, 10000, 12000],
    [18, 24, 30, 36],
    [6, 9, 13, 17],
    [8, 12, 16, 20],
    [4, 6, 8, 20],
  ),
  5: evo(
    ['vr', 'sr', 'ur'],
    [11000, 13750, 16500],
    [32, 40, 48],
    [12, 18, 23],
    [18, 24, 30],
    [12, 16, 30],
    [6, 8, 10],
  ),
}

const LEAD: Record<number, Partial<Record<RarityCode, EvoCost>>> = {
  2: evo(
    ['uc', 'r', 'vr', 'sr', 'ur'],
    [1000, 1500, 2000, 2500, 3000],
    [6, 9, 13, 18, 23],
    [0, 1, 2, 3, 3],
  ),
  3: evo(
    ['uc', 'r', 'vr', 'sr', 'ur'],
    [1875, 3250, 4625, 6000, 7375],
    [12, 18, 26, 36, 46],
    [1, 3, 5, 8, 8],
    [4, 6, 8, 10, 12],
  ),
  4: evo(
    ['r', 'vr', 'sr', 'ur'],
    [4750, 6875, 9000, 11125],
    [27, 39, 54, 69],
    [6, 9, 13, 13],
    [12, 16, 20, 24],
    [6, 8, 10, 12],
  ),
  5: evo(
    ['vr', 'sr', 'ur'],
    [9500, 12500, 15500],
    [52, 72, 92],
    [12, 18, 18],
    [24, 30, 36],
    [16, 20, 24],
    [8, 10, 12],
  ),
}

const DEFENDER: Record<number, Partial<Record<RarityCode, EvoCost>>> = {
  2: evo(
    ['c', 'uc', 'r', 'vr', 'sr'],
    [250, 500, 750, 1000, 1250],
    [2, 3, 5, 7, 10],
    [0, 0, 1, 2, 3],
  ),
  3: evo(
    ['uc', 'r', 'vr', 'sr'],
    [1250, 1875, 2500, 3125],
    [7, 10, 15, 20],
    [1, 3, 5, 8],
    [2, 3, 4, 5],
  ),
  4: evo(
    ['r', 'vr', 'sr'],
    [3000, 4000, 5000],
    [15, 22, 30],
    [6, 9, 13],
    [7, 9, 11],
    [3, 4, 5],
  ),
  5: evo(
    ['vr', 'sr'],
    [5500, 6875],
    [30, 40],
    [12, 18],
    [13, 16],
    [9, 11],
    [4, 5],
  ),
}

const GATES: Array<{ level: number; star: number }> = [
  { level: 10, star: 2 },
  { level: 20, star: 3 },
  { level: 30, star: 4 },
  { level: 40, star: 5 },
]

const STANDARD_BASE: Record<RarityCode, number> = {
  c: 100,
  uc: 150,
  r: 200,
  vr: 250,
  sr: 300,
  ur: 400,
}

const DEFENDER_BASE: Record<RarityCode, number> = {
  c: 50,
  uc: 75,
  r: 100,
  vr: 125,
  sr: 150,
  ur: 0,
}

function asRarity(rarity: string): RarityCode {
  if (
    rarity === 'c' ||
    rarity === 'uc' ||
    rarity === 'r' ||
    rarity === 'vr' ||
    rarity === 'sr' ||
    rarity === 'ur'
  ) {
    return rarity
  }

  return 'c'
}

function tableFor(kind: CostKind) {
  if (kind === 'survivor') return SURVIVOR
  if (kind === 'lead') return LEAD
  if (kind === 'defender') return DEFENDER
  return HERO_WEAPON_TRAP
}

function baseXp(kind: CostKind, rarity: RarityCode) {
  if (kind === 'defender') {
    return DEFENDER_BASE[rarity]
  }

  if (kind === 'hero' && rarity === 'ur') {
    return 300
  }

  return STANDARD_BASE[rarity]
}

export function emptyUpgradeSpend(): UpgradeSpend {
  return EMPTY_SPEND()
}

export function addUpgradeSpend(total: UpgradeSpend, extra: UpgradeSpend) {
  ;(Object.keys(total) as Array<keyof UpgradeSpend>).forEach((key) => {
    total[key] += extra[key]
  })

  return total
}

export function upgradeSpend(options: {
  costKind: CostKind
  rarity: string
  level: number
  maxLevel: number
  targetLevel: number
  /** Current star. Gates already passed are not charged again. */
  starTier?: number
}): UpgradeSpend {
  const spend = EMPTY_SPEND()
  const from = Math.max(1, Math.floor(options.level || 1))
  const cap = Math.max(from, Math.floor(options.maxLevel || from))
  const to = Math.max(from, Math.min(cap, Math.floor(options.targetLevel || from)))

  if (to <= from) {
    return spend
  }

  const rarity = asRarity(options.rarity)
  const xp = (baseXp(options.costKind, rarity) * (to * (to - 1) - from * (from - 1))) / 2
  const table = tableFor(options.costKind)

  if (options.costKind === 'weapon' || options.costKind === 'trap') {
    spend.schematicXp += xp
  } else {
    spend.peopleXp += xp
  }

  GATES.forEach((gate) => {
    if (options.starTier !== undefined && options.starTier >= gate.star) {
      return
    }

    if (from <= gate.level && to > gate.level) {
      const evoCost = table[gate.star]?.[rarity]

      if (!evoCost) {
        return
      }

      if (options.costKind === 'weapon' || options.costKind === 'trap') {
        spend.schematicXp += evoCost.xp
        spend.schematicManuals += evoCost.manuals
      } else {
        spend.peopleXp += evoCost.xp
        spend.trainingManuals += evoCost.manuals
      }

      spend.rain += evoCost.rain
      spend.lightning += evoCost.lightning
      spend.eye += evoCost.eye
      spend.shard += evoCost.shard
    }
  })

  const superchargers = Math.max(0, to - 50) - Math.max(0, from - 50)

  if (superchargers > 0) {
    if (options.costKind === 'weapon') spend.weaponSupercharger += superchargers
    else if (options.costKind === 'trap') spend.trapSupercharger += superchargers
    else if (options.costKind === 'survivor' || options.costKind === 'lead') {
      spend.survivorSupercharger += superchargers
    } else {
      spend.heroSupercharger += superchargers
    }
  }

  return spend
}
