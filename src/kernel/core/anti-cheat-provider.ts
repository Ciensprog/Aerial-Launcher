import type { CommonErrorResponse } from '../../types/services/errors'
import type { AccountData } from '../../types/accounts'
import type { AntiCheatProviderCallbackResponseParam } from '../../types/preload'

import { BrowserWindow } from 'electron'

import { getAntiCheatProvider } from '../../services/endpoints/caldera'
import {
  getAccessTokenUsingDeviceAuth,
  getExchangeCodeAccessToken,
} from '../../services/endpoints/oauth'

export class AntiCheatProvider {
  static requestBulk(
    currentWindow: BrowserWindow,
    accounts: Array<AccountData>
  ) {
    accounts.forEach((account) => {
      currentWindow.webContents.send('schedule:response:providers', {
        account,
        data: {
          accessToken: undefined,
          provider: undefined,
        },
        error: null,
      } as AntiCheatProviderCallbackResponseParam)

      AntiCheatProvider.request(account)
        .then((response: AntiCheatProviderCallbackResponseParam) => {
          currentWindow.webContents.send(
            'schedule:response:providers',
            response
          )
        })
        .catch((response: AntiCheatProviderCallbackResponseParam) => {
          currentWindow.webContents.send(
            'schedule:response:providers',
            response
          )
        })
    })
  }

  static async request(
    account: AccountData
  ): Promise<AntiCheatProviderCallbackResponseParam> {
    try {
      const responseDevice = await getAccessTokenUsingDeviceAuth(account)
      const responseExchange = await getExchangeCodeAccessToken(
        responseDevice.data.access_token
      )
      const responseACProvider = await getAntiCheatProvider({
        accountId: account.accountId,
        exchangeCode: responseExchange.data.code,
      })

      return {
        account,
        data: {
          accessToken: responseDevice.data.access_token,
          provider: responseACProvider.data.provider ?? null,
        },
        error: null,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        account,
        data: null,
        error: (error.response?.data as CommonErrorResponse).errorMessage,
      }
    }
  }
}
