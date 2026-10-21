export const STORM_SHIELD_ZONES = [
  'stonewood',
  'plankerton',
  'canny',
  'twine',
] as const

export type StormShieldZone = (typeof STORM_SHIELD_ZONES)[number]

export const SSD_MAX = 10

export type StormShieldZoneProgress = {
  zone: StormShieldZone
  completed: number
  next: number | null
  endurance: boolean
}

const THEATER_TO_ZONE: Record<number, StormShieldZone> = {
  1: 'stonewood',
  2: 'plankerton',
  3: 'canny',
  4: 'twine',
}

const OUTPOST_QUEST =
  /^quest:outpostquest_t([1-4])_(?:l(\d+)|endless)$/i

export function emptyZoneProgress(
  zone: StormShieldZone
): StormShieldZoneProgress {
  return {
    zone,
    completed: 0,
    next: null,
    endurance: false,
  }
}

export function emptyStormShields() {
  return {
    stonewood: emptyZoneProgress('stonewood'),
    plankerton: emptyZoneProgress('plankerton'),
    canny: emptyZoneProgress('canny'),
    twine: emptyZoneProgress('twine'),
  } as Record<StormShieldZone, StormShieldZoneProgress>
}

export function parseStormShields(
  items: Record<
    string,
    {
      templateId?: string
      attributes?: Record<string, unknown>
    }
  >
): Record<StormShieldZone, StormShieldZoneProgress> {
  const zones = emptyStormShields()

  Object.values(items ?? {}).forEach((item) => {
    const templateId = `${item.templateId ?? ''}`
    const match = OUTPOST_QUEST.exec(templateId)

    if (!match) {
      return
    }

    const zone = THEATER_TO_ZONE[Number(match[1])]

    if (!zone) {
      return
    }

    const state = `${item.attributes?.quest_state ?? ''}`.toLowerCase()
    const done = state === 'claimed' || state === 'completed'
    const active = state === 'active'

    if (match[2]) {
      const level = Number.parseInt(match[2], 10)

      if (!Number.isFinite(level) || level < 1 || level > SSD_MAX) {
        return
      }

      if (done) {
        zones[zone].completed = Math.max(zones[zone].completed, level)
      }

      if (active) {
        zones[zone].next =
          zones[zone].next === null
            ? level
            : Math.min(zones[zone].next, level)
      }

      return
    }

    if (done || active) {
      zones[zone].endurance = true
    }
  })

  STORM_SHIELD_ZONES.forEach((zone) => {
    const next = zones[zone].next

    if (next !== null && next > 1) {
      zones[zone].completed = Math.max(zones[zone].completed, next - 1)
    }

    if (zones[zone].endurance) {
      zones[zone].completed = Math.max(zones[zone].completed, SSD_MAX)
    }
  })

  return zones
}

export function stormShieldTotal(
  zones: Record<StormShieldZone, StormShieldZoneProgress>
) {
  return STORM_SHIELD_ZONES.reduce(
    (sum, zone) => sum + zones[zone].completed,
    0
  )
}
