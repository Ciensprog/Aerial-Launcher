import type { AccountData } from '../../types/accounts'
import type { EpicGameEntry } from '../../types/games-launcher'

import childProcess from 'node:child_process'

import { app, dialog, nativeImage, type NativeImage } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { getLauncherExchangeCode } from '../../lib/epic/launcher-exchange'
import { getIconCandidates, isImageIcon } from '../../lib/games-launcher/icons'
import { scanEpicGames } from '../../lib/games-launcher/scanner'
import { parseCustomDisplayName } from '../../lib/utils'

import { MainWindow } from '../startup/windows/main'
import { DataDirectory } from '../startup/data-directory'
import { Authentication } from './authentication'

export class GamesLauncher {
  static async pickEpicDir() {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    return result.canceled ? null : result.filePaths[0] ?? null
  }

  static async scan(): Promise<EpicGameEntry[]> {
    const { settings } = await DataDirectory.getSettingsFile()
    const scanned = scanEpicGames(
      settings.epicGamesDir,
      settings.epicGamesExtraDirs ?? [],
    )

    const games: EpicGameEntry[] = []
    for (const game of scanned) {
      let icon: string | undefined
      for (const iconPath of getIconCandidates(game)) {
        try {
          const fileIcon = isImageIcon(iconPath)
            ? nativeImage.createFromPath(iconPath)
            : await app.getFileIcon(iconPath, { size: 'large' })
          if (fileIcon.isEmpty()) continue
          icon = fitIcon(fileIcon).toDataURL()
          break
        } catch {
          //
        }
      }

      games.push({
        id: `${game.appName}|${game.launchExe}`,
        displayName: game.displayName,
        appName: game.appName,
        workingDir: game.workingDir,
        launchExe: game.launchExe,
        exchangeLaunch: game.exchangeLaunch,
        editor: game.editor,
        catalogNamespace: game.catalogNamespace,
        launchCommand: game.launchCommand,
        icon,
      })
    }

    return games
  }

  static async launch(account: AccountData, game: EpicGameEntry) {
    const sendResult = (status: boolean) => {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.GamesLauncherNotification,
        { account, game, status },
      )
    }

    try {
      // Only launch executables found by our own manifest scan, never a path
      // supplied by the renderer
      const scanned = (await GamesLauncher.scan()).find(
        (item) => item.id === game.id,
      )

      if (!scanned?.exchangeLaunch) {
        sendResult(false)
        return
      }

      const accessToken = await Authentication.verifyAccessToken(account)
      if (!accessToken) {
        sendResult(false)
        return
      }

      const exchangeCode = await getLauncherExchangeCode(accessToken)
      if (!exchangeCode) {
        sendResult(false)
        return
      }

      // Spawn the executable directly with an argument list (no cmd.exe), so
      // display names and manifest values can't be interpreted by a shell
      const args = [
        ...splitLaunchCommand(scanned.launchCommand),
        '-AUTH_LOGIN=unused',
        `-AUTH_PASSWORD=${exchangeCode}`,
        '-AUTH_TYPE=exchangecode',
        `-epicapp=${scanned.appName}`,
        '-epicenv=Prod',
        '-EpicPortal',
        scanned.catalogNamespace
          ? `-epicsandboxid=${scanned.catalogNamespace}`
          : undefined,
        `-epicusername=${parseCustomDisplayName(account)}`,
        `-epicuserid=${account.accountId}`,
      ].filter((part): part is string => Boolean(part))

      const child = childProcess.spawn(scanned.launchExe, args, {
        cwd: scanned.workingDir,
        detached: true,
        stdio: 'ignore',
        windowsHide: false,
      })

      child.once('error', (error) => {
        console.error('[GamesLauncher] launch failed:', error)
        sendResult(false)
      })
      child.once('spawn', () => {
        child.unref()
        sendResult(true)
      })
    } catch {
      sendResult(false)
    }
  }
}
/**
 * Splits a manifest LaunchCommand ("-foo -bar=\"a b\"") into arguments,
 * honouring double quotes
 */
function splitLaunchCommand(value?: string) {
  if (!value) {
    return []
  }

  return (value.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []).map((part) =>
    part.replace(/"/g, ''),
  )
}

const ICON_MAX_SIZE = 64

/**
 * Shrinks an icon to fit ICON_MAX_SIZE keeping its aspect ratio
 * (never upscales, so small exe icons don't get blurry)
 */
function fitIcon(image: NativeImage) {
  const { width, height } = image.getSize()

  if (width <= ICON_MAX_SIZE && height <= ICON_MAX_SIZE) {
    return image
  }

  return width >= height
    ? image.resize({ width: ICON_MAX_SIZE, quality: 'best' })
    : image.resize({ height: ICON_MAX_SIZE, quality: 'best' })
}
