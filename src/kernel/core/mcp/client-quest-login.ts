import type { AccountData } from '../../../types/accounts'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

import { Authentication } from '../authentication'

import { setClientQuestLogin } from '../../../services/endpoints/mcp'

export class MCPClientQuestLogin {
  static async save(currentWindow: BrowserWindow, account: AccountData) {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

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

    currentWindow.webContents.send(
      ElectronAPIEventKeys.SaveQuestsNotification
    )
  }
}
