import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

import type { ScannedGame } from './scanner'

const GTA_ICON_CANDIDATES = [
  'GTA5_Enhanced.exe',
  'GTA5.exe',
  'GTA5_Enhanced_BE.exe',
]

const EMS_DIR = path.join(
  process.env.ProgramData ?? 'C:\\ProgramData',
  'Epic',
  'EpicGamesLauncher',
  'Data',
  'EMS',
  'EpicGamesLauncher',
)

const EMS_NAME_HINTS: [RegExp, string][] = [
  [/grand theft auto/i, 'gta'],
  [/rocket league/i, 'rocket'],
  [/farming simulator/i, 'farming'],
]

export function findEpicEmsIcon(displayName: string): string | undefined {
  if (!existsSync(EMS_DIR)) return undefined

  const normalized = displayName.toLowerCase().replace(/®/g, '').trim()
  for (const [pattern, hint] of EMS_NAME_HINTS) {
    if (!pattern.test(normalized)) continue
    const match = readdirSync(EMS_DIR).find((file) => {
      const lower = file.toLowerCase()
      return (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg'))
        && lower.includes(hint)
    })
    if (match) return path.join(EMS_DIR, match)
  }

  const words = normalized
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4 && !IGNORED_EMS_WORDS.has(word))

  if (words.length === 0) return undefined

  let bestMatch: string | undefined
  let bestScore = 0

  for (const file of readdirSync(EMS_DIR)) {
    const lower = file.toLowerCase()
    if (!/\.(png|jpg|jpeg)$/.test(lower)) continue

    const score = words.reduce((total, word) => (
      lower.includes(word) ? total + word.length : total
    ), 0)

    if (score > bestScore) {
      bestScore = score
      bestMatch = path.join(EMS_DIR, file)
    }
  }

  return bestScore >= 4 ? bestMatch : undefined
}

export function getIconCandidates(game: ScannedGame): string[] {
  const candidates: string[] = []
  const add = (filePath: string) => {
    const normalized = path.resolve(filePath)
    if (existsSync(normalized) && !candidates.includes(normalized)) {
      candidates.push(normalized)
    }
  }

  const emsIcon = findEpicEmsIcon(game.displayName)
  if (emsIcon) add(emsIcon)

  const name = game.displayName.toLowerCase()
  const launchName = path.basename(game.launchExe).toLowerCase()
  const isGta = name.includes('grand theft auto')
    || launchName.includes('playgtav')
    || launchName.includes('rockstar')

  if (isGta) {
    for (const fileName of GTA_ICON_CANDIDATES) {
      add(path.join(game.installDir, fileName))
    }
  }

  add(game.launchExe)
  return candidates
}

export function isImageIcon(filePath: string) {
  return /\.(png|jpg|jpeg|ico|webp)$/i.test(filePath)
}

const IGNORED_EMS_WORDS = new Set([
  'game',
  'games',
  'online',
  'enhanced',
  'edition',
  'definitive',
  'complete',
  'version',
  'simulator',
])