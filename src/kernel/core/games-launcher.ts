import type { AccountData } from '../../types/accounts'
import type { EpicGameEntry } from '../../types/games-launcher'

import childProcess from 'node:child_process'
import path from 'node:path'

import { app, nativeImage } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { getLauncherExchangeCode } from '../../lib/epic/launcher-exchange'
import { getIconCandidates, isImageIcon } from '../../lib/games-launcher/icons'
import { scanEpicGames } from '../../lib/games-launcher/scanner'
import { parseCustomDisplayName } from '../../lib/utils'

import { MainWindow } from '../startup/windows/main'
import { DataDirectory } from '../startup/data-directory'
import { Authentication } from './authentication'

export class GamesLauncher {
  static async scan(): Promise<EpicGameEntry[]> {
    const { settings } = await DataDirectory.getSettingsFile()
    const scanned = scanEpicGames(settings.epicGamesDir)

    const games: EpicGameEntry[] = []
    for (const game of scanned) {
      let icon: string | undefined
      for (const iconPath of getIconCandidates(game)) {
        try {
          const fileIcon = isImageIcon(iconPath)
            ? nativeImage.createFromPath(iconPath)
            : await app.getFileIcon(iconPath, { size: 'large' })
          if (fileIcon.isEmpty()) continue
          icon = fileIcon.resize({ width: 64, height: 64 }).toDataURL()
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
      if (!game.exchangeLaunch) {
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

      const displayName = parseCustomDisplayName(account)
      const exeName = path.basename(game.launchExe)
      const command = [
        'start',
        '""',
        `"${exeName}"`,
        '-AUTH_LOGIN=unused',
        `-AUTH_PASSWORD=${exchangeCode}`,
        '-AUTH_TYPE=exchangecode',
        `-epicapp=${game.appName}`,
        '-epicenv=Prod',
        '-EpicPortal',
        `-epicusername="${displayName.replace(/"/g, '\\"')}"`,
        `-epicuserid=${account.accountId}`,
      ].join(' ')

      childProcess.exec(command, { cwd: game.workingDir })
      sendResult(true)
    } catch {
      sendResult(false)
    }
  }
}