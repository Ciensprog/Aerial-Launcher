import { DEFAULT_SWAP_DISPLAY_NAME, type ProcessOptions } from './presets'
import { fetchWorldInfoEnglish } from './epic-api'
import { applyWorldInfoModifications } from './world-info-mods'

export type { ProcessOptions } from './presets'

export async function fetchProcessedWorldInfo(
  options: ProcessOptions,
  displayNameValue = DEFAULT_SWAP_DISPLAY_NAME,
) {
  const raw = await fetchWorldInfoEnglish()
  return applyWorldInfoModifications(raw, options, displayNameValue)
}
