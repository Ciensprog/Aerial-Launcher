import { existsSync, readdirSync, statSync } from 'node:fs'
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
  [/unreal engine/i, 'ue_logo'],
  [/unreal editor/i, 'ue_logo'],
]

const UNREAL_ICON_CANDIDATES = [
  ['Engine', 'Content', 'Slate', 'Starship', 'Common', 'UELogo.png'],
  ['Engine', 'Content', 'Editor', 'Slate', 'Old', 'UnrealEd_icon.png'],
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
  const app = game.appName.toLowerCase()
  const isGta = name.includes('grand theft auto')
    || launchName.includes('playgtav')
    || launchName.includes('rockstar')
  const isUnreal = game.editor
    || name.includes('unreal')
    || launchName.includes('unrealeditor')
    || app.startsWith('ue_')

  if (isGta) {
    for (const fileName of GTA_ICON_CANDIDATES) {
      add(path.join(game.installDir, fileName))
    }
  }

  if (isUnreal) {
    add(path.join(EMS_DIR, 'ue_logo.png'))
    add(path.join(EMS_DIR, 'Poodle_Logo.png'))
    for (const parts of UNREAL_ICON_CANDIDATES) {
      add(path.join(game.installDir, ...parts))
    }
  }

  // Some games launch through a tiny stub exe with no icon (e.g.
  // TheEscapists.exe next to TheEscapists_EFIGS.exe), so prefer bigger
  // sibling executables sharing the same name
  for (const sibling of findLargerSiblingExecutables(game.launchExe)) {
    add(sibling)
  }

  add(game.launchExe)
  return candidates
}

const STUB_EXE_MAX_BYTES = 1024 * 1024

function findLargerSiblingExecutables(launchExe: string): string[] {
  try {
    const launchSize = statSync(launchExe).size
    if (launchSize > STUB_EXE_MAX_BYTES) return []

    const directory = path.dirname(launchExe)
    const baseName = path.basename(launchExe, path.extname(launchExe)).toLowerCase()

    return readdirSync(directory)
      .filter((file) => {
        const lower = file.toLowerCase()
        return lower.endsWith('.exe')
          && lower.startsWith(baseName)
          && lower !== path.basename(launchExe).toLowerCase()
      })
      .map((file) => {
        const filePath = path.join(directory, file)
        return { filePath, size: statSync(filePath).size }
      })
      .filter((item) => item.size > launchSize)
      .sort((a, b) => b.size - a.size)
      .map((item) => item.filePath)
  } catch {
    return []
  }
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