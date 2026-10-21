import type { AccountData } from '../../types/accounts'
import type { Settings } from '../../types/settings'

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

const DEFAULT_LAUNCH_DIR =
  'C:\\Program Files\\Epic Games\\Fortnite\\FortniteGame\\Binaries\\Win64'

function getHttpProxyArg(settings: Settings) {
  if (!settings.customProxyEnabled) {
    return null
  }

  const port = Number.parseInt(settings.customProxyPort, 10)

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return null
  }

  return `-HTTP=127.0.0.1:${port}`
}

export class FortniteLauncher {
  static buildLaunchCmd(params: {
    launchDir: string
    exchangeCode: string
    accountId: string
    httpProxyArg?: string | null
  }) {
    const launchDir = params.launchDir.replace(/[/\\]+$/, '') || DEFAULT_LAUNCH_DIR
    const proxy = params.httpProxyArg ? ` ${params.httpProxyArg}` : ''

    return `start /d "${launchDir}" FortniteLauncher.exe -AUTH_LOGIN=unused -AUTH_PASSWORD=${params.exchangeCode} -AUTH_TYPE=exchangecode -epicapp=Fortnite -epicenv=Prod -EpicPortal -epicuserid=${params.accountId}${proxy} & exit`
  }

  static async getLauncherExchangeCode(account: AccountData) {
    const accessToken = await Authentication.verifyAccessToken(account)

    if (!accessToken) {
      return null
    }

    const accountExchangeCode =
      await getExchangeCodeUsingAccessToken(accessToken)

    if (!accountExchangeCode.data.code) {
      return null
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
      return null
    }

    const launcherExchangeCode = await getExchangeCodeUsingAccessToken(
      launcherAccessToken.data.access_token
    )

    return launcherExchangeCode.data.code ?? null
  }

  static async generateCmd(account: AccountData) {
    try {
      const { settings } = await DataDirectory.getSettingsFile()
      const exchangeCode =
        await FortniteLauncher.getLauncherExchangeCode(account)

      if (!exchangeCode) {
        return {
          success: false as const,
          command: null,
        }
      }

      return {
        success: true as const,
        command: FortniteLauncher.buildLaunchCmd({
          launchDir: settings.path || DEFAULT_LAUNCH_DIR,
          exchangeCode,
          accountId: account.accountId,
          httpProxyArg: getHttpProxyArg(settings),
        }),
      }
    } catch {
      return {
        success: false as const,
        command: null,
      }
    }
  }

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
      const { settings } = await DataDirectory.getSettingsFile()
      const launcherExchangeCode =
        await FortniteLauncher.getLauncherExchangeCode(account)

      if (!launcherExchangeCode) {
        sendError()

        return
      }

      const command = [
        'start',
        '""',
        'FortniteLauncher.exe',
        '-AUTH_LOGIN=unused',
        `-AUTH_PASSWORD=${launcherExchangeCode}`,
        '-AUTH_TYPE=exchangecode',
        '-epicapp=Fortnite',
        '-epicenv=Prod',
        '-EpicPortal',
        `-epicusername="${account.displayName}"`,
        `-epicuserid=${account.accountId}`,
        getHttpProxyArg(settings),
      ]
        .filter(Boolean)
        .join(' ')

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
      //
    }

    sendError()
  }
}
