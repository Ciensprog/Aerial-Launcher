import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { DEFAULT_SWAP_DISPLAY_NAME } from './presets'

export { DEFAULT_SWAP_DISPLAY_NAME }

export type MisjeConfig = {
  outputDir: string
  customFilePath: string
  yesterdayFilePath: string
  extraPresets: Array<string>
  displayNameValue: string
}

const DEFAULT: MisjeConfig = {
  outputDir: '',
  customFilePath: '',
  yesterdayFilePath: '',
  extraPresets: [],
  displayNameValue: DEFAULT_SWAP_DISPLAY_NAME,
}

export function getMisjeConfigPath(dataDir: string) {
  return path.join(dataDir, 'misje.json')
}

export function loadMisjeConfig(dataDir: string): MisjeConfig {
  const file = getMisjeConfigPath(dataDir)
  if (!existsSync(file)) return { ...DEFAULT }
  try {
    const parsed = { ...DEFAULT, ...JSON.parse(readFileSync(file, 'utf8')) }
    if (!Array.isArray(parsed.extraPresets)) {
      parsed.extraPresets = []
    }
    if (typeof parsed.displayNameValue !== 'string' || !parsed.displayNameValue.trim()) {
      parsed.displayNameValue = DEFAULT_SWAP_DISPLAY_NAME
    }
    return parsed
  } catch {
    return { ...DEFAULT }
  }
}

export function saveMisjeConfig(dataDir: string, config: Partial<MisjeConfig>) {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
  const next = { ...loadMisjeConfig(dataDir), ...config }
  writeFileSync(getMisjeConfigPath(dataDir), JSON.stringify(next, null, 2), 'utf8')
}