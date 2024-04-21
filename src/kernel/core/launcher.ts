import type { AccountData } from '../../types/accounts'

import childProcess from 'node:child_process'
import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { DataDirectory } from '../startup/data-directory'

import { Authentication } from './authentication'

import { getExchangeCodeUsingAccessToken } from '../../services/endpoints/oauth'

export class FortniteLauncher {
  static async start(currentWindow: BrowserWindow, account: AccountData) {
    try {
      const { settings } = await DataDirectory.getSettingsFile()
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        currentWindow.webContents.send(
          ElectronAPIEventKeys.LauncherNotification,
          {
            account,
            status: false,
          }
        )

        return
      }

      const exchange = await getExchangeCodeUsingAccessToken(accessToken)

      if (exchange.data.code) {
        childProcess.exec(
          `start "" FortniteLauncher.exe -AUTH_LOGIN=unused -AUTH_TYPE=exchangecode -epicapp=Fortnite -epicenv=Prod -epicsandboxid=fn -EpicPortal -steamimportavailable -AUTH_PASSWORD=${exchange.data.code} -epicuserid=${account.accountId} -epicusername="${account.displayName}"`,
          {
            cwd: settings.path,
          }
        )

        currentWindow.webContents.send(
          ElectronAPIEventKeys.LauncherNotification,
          {
            account,
            status: true,
          }
        )

        return
      }
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.LauncherNotification,
      {
        account,
        status: false,
      }
    )
  }
}
