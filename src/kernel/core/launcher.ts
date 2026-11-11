import type { AccountData } from '../../types/accounts'

import childProcess from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'
import { launcherAppClient2 } from '../../config/fortnite/clients'

import { MainWindow } from '../startup/windows/main'
import { DataDirectory } from '../startup/data-directory'
import { Authentication } from './authentication'
// import { Manifest } from './manifest'

import {
  getAccessTokenUsingExchangeCode,
  getExchangeCodeUsingAccessToken,
} from '../../services/endpoints/oauth'

export class FortniteLauncher {
  static async start(account: AccountData) {
    const sendError = () => {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.LauncherNotification,
        {
          account,
          status: false,
        }
      )
    }

    try {
      // const manifest = Manifest.get()

      // if (!manifest) {
      //   sendError()

      //   return
      // }

      const { settings } = await DataDirectory.getSettingsFile()
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        sendError()

        return
      }

      const accountExchangeCode =
        await getExchangeCodeUsingAccessToken(accessToken)

      if (!accountExchangeCode.data.code) {
        sendError()

        return
      }

      const launcherAccessToken = await getAccessTokenUsingExchangeCode(
        accountExchangeCode.data.code,
        {
          headers: {
            Authorization: `basic ${launcherAppClient2.auth}`,
          },
        }
      )

      if (!launcherAccessToken.data.access_token) {
        sendError()

        return
      }

      const launcherExchangeCode = await getExchangeCodeUsingAccessToken(
        launcherAccessToken.data.access_token
      )

      if (!launcherExchangeCode.data.code) {
        sendError()

        return
      }

      // Epic Games Launcher v2 replaced EOSH: Fortnite reaches the launcher
      // through the local API described in this file. Without these args the
      // game can't load its install bundles and fails with "Pak is invalid".
      // Only added when the file exists, so EGL v1 launches are unchanged.
      // (Based on PR #41 by barasalah2)
      const eglv2ApiPath = path.join(
        `${process.env.LOCALAPPDATA}`,
        'com.epicgames.eglv2',
        'api.json',
      )
      const eglv2Args = existsSync(eglv2ApiPath)
        ? ['-eglv2', `-eglv2apipath="${eglv2ApiPath}"`]
        : []

      // The command goes through cmd.exe: strip characters that would break
      // out of the quoted argument or be interpreted by the shell
      const safeDisplayName = `${account.displayName ?? ''}`.replace(
        /["^&|<>%\r\n]/g,
        '',
      )

      const command = [
        'start',
        '""',
        'FortniteLauncher.exe',
        ...eglv2Args,
        // `${manifest.LaunchCommand}`,
        '-AUTH_LOGIN=unused',
        `-AUTH_PASSWORD=${launcherExchangeCode.data.code}`,
        '-AUTH_TYPE=exchangecode',
        '-epicapp=Fortnite',
        '-epicenv=Prod',
        '-EpicPortal',
        // '-steamimportavailable',
        `-epicusername="${safeDisplayName}"`,
        `-epicuserid=${account.accountId}`,
        // '-epiclocale=en',
        // '-epicsandboxid=fn',
      ].join(' ')

      childProcess.exec(
        command,
        {
          cwd: settings.path,
        },
        (error) => {
          if (error) {
            console.error('[FortniteLauncher] Failed to start game:', error)
          }
        },
      )

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.LauncherNotification,
        {
          account,
          status: true,
        }
      )

      return

    } catch (error) {
      console.error('[FortniteLauncher] Launch failed:', error)
    }

    sendError()
  }
}
