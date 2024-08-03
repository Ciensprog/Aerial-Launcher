import type { AccountData } from '../../../types/accounts'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

import { Authentication } from '../authentication'

import { setClientQuestLogin } from '../../../services/endpoints/mcp'

export class MCPClientQuestLogin {
  static async save(
    currentWindow: BrowserWindow,
    accounts: Array<AccountData>
  ) {
    try {
      await Promise.allSettled(
        accounts.map(async (account) => {
          try {
            const accessToken = await Authentication.verifyAccessToken(
              account,
              currentWindow
            )

            if (!accessToken) {
              return
            }

            const { accountId } = account

            await setClientQuestLogin({
              accessToken,
              accountId,
            })
          } catch (error) {
            //
          }
        })
      )
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.SaveQuestsNotification
    )
  }
}
