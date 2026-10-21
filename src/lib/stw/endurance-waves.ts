const ZONE_NAMES = [
  'Stonewood',
  'Plankerton',
  'Canny Valley',
  'Twine Peaks',
] as const

const DAILY_RE = /endurancedaily_t0([1-4])_w(\d+)/i
const WAVE30_RE = /endurancewave30theater0([1-4])/i
const ENDLESS_RE = /outpostquest_t([1-4])_endless/i

export type EnduranceWave = {
  zone: string
  wave: number
}

export function completedEnduranceTemplates(items: unknown) {
  if (!items || typeof items !== 'object') {
    return []
  }

  const ids: Array<string> = []

  for (const item of Object.values(items as Record<string, unknown>)) {
    if (!item || typeof item !== 'object') {
      continue
    }

    const row = item as {
      templateId?: unknown
      attributes?: { quest_state?: unknown }
    }

    if (typeof row.templateId !== 'string') {
      continue
    }

    if (row.attributes?.quest_state !== 'Completed') {
      continue
    }

    if (
      !DAILY_RE.test(row.templateId) &&
      !WAVE30_RE.test(row.templateId) &&
      !ENDLESS_RE.test(row.templateId)
    ) {
      continue
    }

    ids.push(row.templateId)
  }

  return ids
}

/** Highest reward wave per zone. Daily endurance quests land on 5, 10, 15, 20, 25, 30. */
export function enduranceWavesFromTemplates(templateIds: Iterable<string>) {
  const best = new Map<number, number>()

  const note = (zone: number, wave: number) => {
    if (zone < 1 || zone > 4 || wave < 1) {
      return
    }

    const current = best.get(zone) ?? 0

    if (wave > current) {
      best.set(zone, wave)
    }
  }

  for (const id of templateIds) {
    const daily = DAILY_RE.exec(id)

    if (daily) {
      note(Number(daily[1]), Number(daily[2]))
      continue
    }

    const wave30 = WAVE30_RE.exec(id)

    if (wave30) {
      note(Number(wave30[1]), 30)
      continue
    }

    const endless = ENDLESS_RE.exec(id)

    if (endless) {
      note(Number(endless[1]), 30)
    }
  }

  return [...best.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([zone, wave]) => ({
      zone: ZONE_NAMES[zone - 1],
      wave,
    }))
}

export function enduranceWaveLines(waves: Array<EnduranceWave> | undefined) {
  if (!waves || waves.length <= 0) {
    return []
  }

  return waves.map((row) => `${row.zone} Endurance · Wave ${row.wave}`)
}
