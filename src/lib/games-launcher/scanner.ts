import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export type ScannedGame = {
  displayName: string
  appName: string
  installDir: string
  workingDir: string
  launchExe: string
  exchangeLaunch: boolean
}

const MANIFESTS_DIR = path.join(
  process.env.ProgramData ?? 'C:\\ProgramData',
  'Epic',
  'EpicGamesLauncher',
  'Data',
  'Manifests',
)

const SKIP_APP_NAMES = new Set(['fortnite', 'fortnite_studio', 'fabplugin_5.7'])

export function scanEpicGames(epicGamesDir: string): ScannedGame[] {
  const epicRoot = path.resolve(epicGamesDir).toLowerCase()
  const byAppName = new Map<string, ScannedGame>()

  if (existsSync(MANIFESTS_DIR)) {
    for (const filename of readdirSync(MANIFESTS_DIR).sort()) {
      if (!filename.endsWith('.item')) continue
      parseManifest(path.join(MANIFESTS_DIR, filename), epicRoot, byAppName)
    }
  }

  const games = [...byAppName.values()]
  games.sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }))
  return games
}

function parseManifest(
  manifestPath: string,
  epicRoot: string,
  byAppName: Map<string, ScannedGame>,
) {
  try {
    const item = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      LaunchExecutable?: string
      AppName?: string
      DisplayName?: string
      InstallLocation?: string
    }

    const launchExecutable = item.LaunchExecutable?.trim() ?? ''
    if (!launchExecutable) return

    const appName = item.AppName?.trim() ?? ''
    const displayName = item.DisplayName?.trim() ?? ''
    const installLocation = item.InstallLocation?.trim() ?? ''
    if (!appName || !displayName || !installLocation) return
    if (shouldSkip(appName, displayName, launchExecutable)) return

    const installPath = path.resolve(installLocation)
    if (!installPath.toLowerCase().startsWith(epicRoot)) return
    if (!existsSync(installPath)) return

    const entry = buildEntry(appName, displayName, installPath, launchExecutable)
    if (entry) addOrReplace(byAppName, entry)
  } catch {
    //
  }
}

function buildEntry(
  appName: string,
  displayName: string,
  installPath: string,
  launchExecutable: string,
): ScannedGame | null {
  const launchPath = path.resolve(installPath, launchExecutable.replace(/\//g, '\\'))
  if (!existsSync(launchPath)) return null

  return {
    displayName: normalizeDisplayName(displayName),
    appName,
    installDir: installPath,
    workingDir: path.dirname(launchPath),
    launchExe: launchPath,
    exchangeLaunch: canLaunchWithExchange(launchPath, displayName),
  }
}

function shouldSkip(
  appName: string,
  displayName: string,
  launchExecutable: string,
): boolean {
  const app = appName.toLowerCase()
  const name = displayName.toLowerCase()
  const launch = launchExecutable.toLowerCase()

  if (SKIP_APP_NAMES.has(app)) return true
  if (app.startsWith('ue_') || name.includes('unreal engine')) return true
  if (name.includes('quixel') || name.includes('fab ')) return true
  if (launch.includes('unrealeditor')) return true
  if (app.includes('fabplugin')) return true
  if (name === 'fortnite' || name.startsWith('fortnite ')) return true
  return false
}

function canLaunchWithExchange(launchPath: string, displayName: string): boolean {
  const fileName = path.basename(launchPath).toLowerCase()
  const name = displayName.toLowerCase()
  if (name.includes('grand theft auto') || fileName.includes('playgtav') || fileName.includes('rockstar')) {
    return false
  }
  return true
}

function normalizeDisplayName(displayName: string) {
  return displayName.replace(/®/g, '').replace(/\s+/g, ' ').trim()
}

function appKey(appName: string) {
  return appName.toLowerCase()
}

function addOrReplace(byAppName: Map<string, ScannedGame>, entry: ScannedGame) {
  const key = appKey(entry.appName)
  const existing = byAppName.get(key)
  if (!existing) {
    byAppName.set(key, entry)
    return
  }
  byAppName.set(key, pickBetterEntry(existing, entry))
}

function pickBetterEntry(a: ScannedGame, b: ScannedGame): ScannedGame {
  if (a.exchangeLaunch !== b.exchangeLaunch) {
    return a.exchangeLaunch ? a : b
  }

  const aLauncher = path.basename(a.launchExe).toLowerCase().includes('launcher')
  const bLauncher = path.basename(b.launchExe).toLowerCase().includes('launcher')
  if (aLauncher !== bLauncher) {
    return aLauncher ? a : b
  }

  return a.displayName.length >= b.displayName.length ? a : b
}