import {
  DEFAULT_SWAP_DISPLAY_NAME,
  type ProcessOptions,
} from './presets'

const REPLACEMENT_PHRASE = ' USE CODE Mikro900'

const ZONE_REPLACEMENTS: Record<string, string> = {
  Theater_Phoenix_Zone02: 'Theater_Start_Zone2',
  Theater_Phoenix_Zone03: 'Theater_Start_Zone3',
  Theater_Phoenix_Group_Zone03: 'Theater_Start_Group_Zone3',
  Theater_Phoenix_Zone05: 'Theater_Start_Zone5',
  Theater_Phoenix_Group_Zone05: 'Theater_Start_Group_Zone5',
  Theater_Phoenix_Zone07: 'Theater_Normal_Zone2',
  Theater_Phoenix_Group_Zone07: 'Theater_Normal_Group_Zone2',
  Theater_Phoenix_Zone09: 'Theater_Normal_Zone4',
  Theater_Phoenix_Group_Zone09: 'Theater_Normal_Group_Zone4',
  Theater_Phoenix_Zone11: 'Theater_Hard_Zone1',
  Theater_Phoenix_Group_Zone11: 'Theater_Hard_Group_Zone1',
  Theater_Phoenix_Zone13: 'Theater_Hard_Zone3',
  Theater_Phoenix_Group_Zone13: 'Theater_Hard_Group_Zone3',
  Theater_Phoenix_Zone15: 'Theater_Hard_Zone5',
  Theater_Phoenix_Group_Zone15: 'Theater_Hard_Group_Zone5',
  Theater_Phoenix_Zone17: 'Theater_Nightmare_Zone2',
  Theater_Phoenix_Group_Zone17: 'Theater_Nightmare_Group_Zone2',
  Theater_Phoenix_Zone19: 'Theater_Nightmare_Zone4',
  Theater_Phoenix_Group_Zone19: 'Theater_Nightmare_Group_Zone4',
  Theater_Phoenix_Zone21: 'Theater_Endgame_Zone1',
  Theater_Phoenix_Group_Zone21: 'Theater_Endgame_Group_Zone1',
  Theater_Phoenix_Zone23: 'Theater_Endgame_Zone3',
  Theater_Phoenix_Group_Zone23: 'Theater_Endgame_Group_Zone3',
  Theater_Phoenix_Zone25: 'Theater_Endgame_Zone5',
  Theater_Phoenix_Group_Zone25: 'Theater_Endgame_Group_Zone5',
  HV3_01: 'Start_Zone4',
  HV3_02: 'Start_Zone5',
  HV3_03: 'Normal_Zone2',
  HV3_04: 'Normal_Zone4',
  HV3_05: 'Hard_Zone1',
  HV3_06: 'Hard_Zone3',
  HV3_07: 'Hard_Zone5',
  HV3_08: 'Nightmare_Zone2',
  HV3_09: 'Nightmare_Zone4',
  HV3_10: 'Endgame_Zone1',
  HV3_11: 'Endgame_Zone3',
  HV3_12: 'Endgame_Zone5',
  _Starlight_Start_Zone2: '_Start_Zone3',
  _StarlightTimed_Start_Zone2: '_Start_Zone3',
  Theater_Starlight_: 'Theater_',
  _StarlightTimed_: '_',
  Theater_Endless_: 'Theater_',
  Theater_Mayday_Start_Zone5: 'Theater_Start_Zone5',
  Theater_Mayday_Normal_Zone3: 'Theater_Normal_Zone3',
  Theater_Mayday_Normal_Zone5: 'Theater_Normal_Zone5',
  Theater_Mayday_Hard_Zone3: 'Theater_Hard_Zone3',
  Theater_Mayday_Hard_Zone5: 'Theater_Hard_Zone5',
  Theater_Mayday_Nightmare_Zone3: 'Theater_Nightmare_Zone3',
  Theater_Mayday_Nightmare_Zone5: 'Theater_Nightmare_Zone5',
  Theater_Mayday_Endgame_Zone5: 'Theater_Endgame_Zone5',
  '/Game/World/ZoneThemes/ZT_TP/BP_ZT_TP_Island01.BP_ZT_TP_Island01_C':
    '/SaveTheWorld/World/ZoneThemes/ZT_TP/BP_ZT_TP_Island01.BP_ZT_TP_Island01_C',
}

export function applyWorldInfoModifications(
  data: unknown,
  options: ProcessOptions,
  displayNameValue = DEFAULT_SWAP_DISPLAY_NAME,
): unknown {
  let current = normalizeEnglishDisplayNames(structuredClone(data))
  if (options.changeTheater) current = changeTheaterType(current)
  if (options.replacePhrases) {
    current = processRequirementsEventFlag(current)
    current = changeTheaterSlot2To0(current)
    current = changeTheaterSlotNeg1To2(current)
    current = changeTheaterZoneNames(current)
  }
  if (options.changeDisplayName) {
    current = changeDisplayNameType(current, displayNameValue)
  }
  if (options.changeDifficulty) current = changeTheaterDupe(current)
  return current
}

function normalizeEnglishDisplayNames(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) {
    return value.map((item) => normalizeEnglishDisplayNames(item))
  }
  if (typeof value === 'object') {
    const source = value as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(source)) {
      if (key === 'displayName' && entry && typeof entry === 'object' && !Array.isArray(entry)) {
        const localized = entry as Record<string, unknown>
        const english = localized.en
        result[key] = typeof english === 'string' ? english : normalizeEnglishDisplayNames(entry)
      } else {
        result[key] = normalizeEnglishDisplayNames(entry)
      }
    }
    return result
  }
  return value
}

function processRequirementsEventFlag(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) {
    return value.map((item) => processRequirementsEventFlag(item))
  }
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      const newKey = key.replace(/(Requirements|eventFlag)/gi, REPLACEMENT_PHRASE)
      result[newKey] = processRequirementsEventFlag(entry)
    }
    return result
  }
  if (typeof value === 'string') {
    return value.replace(/(Requirements|eventFlag)/gi, REPLACEMENT_PHRASE)
  }
  return value
}

function walkObject(value: unknown, fn: (obj: Record<string, unknown>, key: string, entry: unknown) => void): unknown {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) {
    return value.map((item) => walkObject(item, fn))
  }
  if (typeof value === 'object') {
    const obj = { ...(value as Record<string, unknown>) }
    for (const [key, entry] of Object.entries(obj)) {
      if (entry !== null && typeof entry === 'object') {
        obj[key] = walkObject(entry, fn)
      }
    }
    for (const key of Object.keys(obj)) {
      fn(obj, key, obj[key])
    }
    return obj
  }
  return value
}

function changeTheaterType(value: unknown) {
  return walkObject(value, (obj, key, entry) => {
    if (key === 'theaterType' && entry === 'Tutorial') obj[key] = 'Standard'
    if (key === 'bHideLikeTestTheater' && entry === true) obj[key] = false
  })
}

function changeDisplayNameType(value: unknown, displayNameValue: string) {
  const nextName = displayNameValue.trim() || DEFAULT_SWAP_DISPLAY_NAME
  return walkObject(value, (obj, key) => {
    if (key === 'displayName') obj[key] = nextName
  })
}

function changeTheaterSlot2To0(value: unknown) {
  return walkObject(value, (obj, key, entry) => {
    if (key === 'theaterSlot' && entry === 2) obj[key] = 0
  })
}

function changeTheaterSlotNeg1To2(value: unknown) {
  return walkObject(value, (obj, key, entry) => {
    if (key === 'theaterSlot' && entry === -1) obj[key] = 2
  })
}

function changeTheaterDupe(value: unknown) {
  return walkObject(value, (obj, key, entry) => {
    if (key === 'tileType' && entry === 'Outpost') obj[key] = 'AlwaysActive'
  })
}

function replaceZoneValue(value: string) {
  let result = value
  for (const [from, to] of Object.entries(ZONE_REPLACEMENTS)) {
    if (result.includes(from)) {
      result = result.split(from).join(to)
    }
  }
  return result
}

function changeTheaterZoneNames(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) {
    return value.map((item) => changeTheaterZoneNames(item))
  }
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      result[key] = typeof entry === 'string'
        ? replaceZoneValue(entry)
        : changeTheaterZoneNames(entry)
    }
    return result
  }
  return value
}
