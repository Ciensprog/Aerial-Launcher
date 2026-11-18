import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export type ScannedGame = {
  displayName: string
  appName: string
  installDir: string
  workingDir: string
  launchExe: string
  exchangeLaunch: boolean
  editor: boolean
  catalogNamespace?: string
  launchCommand?: string
}

const MANIFESTS_DIR = path.join(
  process.env.ProgramData ?? 'C:\\ProgramData',
  'Epic',
  'EpicGamesLauncher',
  'Data',
  'Manifests',
)

const SKIP_APP_NAMES = new Set(['fortnite', 'fabplugin_5.7'])

export function scanEpicGames(
  epicGamesDir: string,
  extraDirs: string[] = [],
): ScannedGame[] {
  const roots = [epicGamesDir, ...extraDirs]
    .map((dir) => path.resolve(dir).toLowerCase().replace(/[\\/]+$/, ''))
    .filter((dir, index, list) => dir !== '' && list.indexOf(dir) === index)
  const byAppName = new Map<string, ScannedGame>()

  if (existsSync(MANIFESTS_DIR)) {
    for (const filename of readdirSync(MANIFESTS_DIR).sort()) {
      if (!filename.endsWith('.item')) continue
      parseManifest(path.join(MANIFESTS_DIR, filename), roots, byAppName)
    }
  }

  const games = [...byAppName.values()]
  games.sort((a, b) => {
    if (a.editor !== b.editor) return a.editor ? -1 : 1
    return a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' })
  })
  return games
}

function isUnderRoot(installPath: string, root: string) {
  const location = installPath.toLowerCase()

  return location === root || location.startsWith(`${root}\\`) || location.startsWith(`${root}/`)
}

function parseManifest(
  manifestPath: string,
  roots: string[],
  byAppName: Map<string, ScannedGame>,
) {
  try {
    const item = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      LaunchExecutable?: string
      LaunchCommand?: string
      AppName?: string
      DisplayName?: string
      InstallLocation?: string
      AppVersionString?: string
      CatalogNamespace?: string
    }

    const launchExecutable = item.LaunchExecutable?.trim() ?? ''
    if (!launchExecutable) return

    const appName = item.AppName?.trim() ?? ''
    const displayName = item.DisplayName?.trim() ?? ''
    const installLocation = item.InstallLocation?.trim() ?? ''
    if (!appName || !displayName || !installLocation) return
    if (shouldSkip(appName, displayName, launchExecutable)) return

    const installPath = path.resolve(installLocation)
    if (!roots.some((root) => isUnderRoot(installPath, root))) return
    if (!existsSync(installPath)) return

    const entry = buildEntry(
      appName,
      displayName,
      installPath,
      launchExecutable,
      item.AppVersionString,
      item.CatalogNamespace,
      item.LaunchCommand,
    )
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
  appVersionString?: string,
  catalogNamespace?: string,
  launchCommand?: string,
): ScannedGame | null {
  const launchPath = path.resolve(installPath, launchExecutable.replace(/\//g, '\\'))
  if (!existsSync(launchPath)) return null

  const editor = isUnrealEditor(appName, displayName, launchExecutable)

  return {
    displayName: normalizeDisplayName(displayName, appName, appVersionString),
    appName,
    installDir: installPath,
    workingDir: path.dirname(launchPath),
    launchExe: launchPath,
    exchangeLaunch: canLaunchWithExchange(launchPath, displayName),
    editor,
    catalogNamespace: catalogNamespace?.trim() || undefined,
    launchCommand: launchCommand?.trim() || undefined,
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
  if (isUnrealEditor(appName, displayName, launchExecutable)) return false
  if (name.includes('quixel') || name.includes('fab ')) return true
  if (launch.includes('unrealeditor')) return true
  if (app.includes('fabplugin')) return true
  if (name === 'fortnite' || name.startsWith('fortnite ')) return true
  return false
}

export function isUnrealEditor(
  appName: string,
  displayName: string,
  launchExecutable: string,
): boolean {
  const app = appName.toLowerCase()
  const name = displayName.toLowerCase()
  const launch = launchExecutable.toLowerCase()

  if (app.startsWith('ue_')) return true
  if (app === 'fortnite_studio') return true
  if (name.includes('unreal engine')) return true
  if (name.includes('unreal editor')) return true
  if (launch.includes('unrealeditor')) return true
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

function normalizeDisplayName(
  displayName: string,
  appName: string,
  appVersionString?: string,
) {
  let name = displayName.replace(/®/g, '').replace(/\s+/g, ' ').trim()

  if (/^UE_\d/i.test(appName) && !/\d+\.\d+/.test(name)) {
    const fromVersion = appVersionString?.match(/^(\d+\.\d+(?:\.\d+)?)/)?.[1]
    const fromApp = appName.match(/^UE_(\d+\.\d+)/i)?.[1]
    const version = fromVersion ?? fromApp
    if (version) name = `${name} ${version}`
  }

  return name
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

  const aEditorExe = path.basename(a.launchExe).toLowerCase().includes('unrealeditor')
  const bEditorExe = path.basename(b.launchExe).toLowerCase().includes('unrealeditor')
  if (aEditorExe !== bEditorExe) {
    return aEditorExe ? a : b
  }

  const aLauncher = path.basename(a.launchExe).toLowerCase().includes('launcher')
  const bLauncher = path.basename(b.launchExe).toLowerCase().includes('launcher')
  if (aLauncher !== bLauncher) {
    return aLauncher ? a : b
  }

  return a.displayName.length >= b.displayName.length ? a : b
}
