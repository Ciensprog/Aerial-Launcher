import type { AccountData } from '../../../types/accounts'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

import { MainWindow } from '../../startup/windows/main'
import { Authentication } from '../authentication'

import { setClientQuestLogin } from '../../../services/endpoints/mcp'

export class MCPClientQuestLogin {
  static async save(accounts: Array<AccountData>) {
    try {
      await Promise.allSettled(
        accounts.map(async (account) => {
          try {
            const accessToken =
              await Authentication.verifyAccessToken(account)

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

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.SaveQuestsNotification
    )
  }
}
