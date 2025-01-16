import type { AccountData } from '../../types/accounts'

import childProcess from 'node:child_process'

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

      const command = [
        'start',
        '""',
        'FortniteLauncher.exe',
        // `${manifest.LaunchCommand}`,
        '-AUTH_LOGIN=unused',
        `-AUTH_PASSWORD=${launcherExchangeCode.data.code}`,
        '-AUTH_TYPE=exchangecode',
        '-epicapp=Fortnite',
        '-epicenv=Prod',
        '-EpicPortal',
        // '-steamimportavailable',
        `-epicusername="${account.displayName}"`,
        `-epicuserid=${account.accountId}`,
        // '-epiclocale=en',
        // '-epicsandboxid=fn',
      ].join(' ')

      childProcess.exec(command, {
        cwd: settings.path,
      })

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.LauncherNotification,
        {
          account,
          status: true,
        }
      )

      return

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error(error)
    }

    sendError()
  }
}
