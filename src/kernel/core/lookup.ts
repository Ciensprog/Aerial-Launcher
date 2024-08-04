import type {
  XPBoostsSearchUserConfig,
  XPBoostsSearchUserData,
} from '../../types/xpboosts'

import { BrowserWindow } from 'electron'

import { Authentication } from './authentication'

import {
  findUserByAccountId,
  findUserByDisplayName,
  findUserByExternalDisplayName,
} from '../../services/endpoints/lookup'

export class LookupManager {
  static async searchUserByDisplayName({
    account,
    currentWindow,
    displayName,
  }: {
    currentWindow: BrowserWindow
  } & Pick<XPBoostsSearchUserConfig, 'account' | 'displayName'>): Promise<
    | {
        data: null
        success: false
        errorMessage: number | string | null
      }
    | {
        data: XPBoostsSearchUserData['lookup']
        success: true
        errorMessage: number | string | null
      }
  > {
    const defaultResponse: {
      data: null
      success: false
      errorMessage: number | string | null
    } = {
      data: null,
      success: false,
      errorMessage: null,
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(
        account,
        currentWindow
      )

      if (!accessToken) {
        return defaultResponse
      }

      if (displayName.length >= 28 && displayName.length <= 34) {
        try {
          const response = await findUserByAccountId({
            accessToken,
            accountId: displayName,
          })

          if (response.data) {
            return {
              data: response.data,
              errorMessage: null,
              success: true,
            } as const
          }
        } catch (error) {
          //
        }
      }

      const response = await findUserByDisplayName({
        accessToken,
        displayName,
      })

      if (response.data) {
        return {
          data: response.data,
          errorMessage: null,
          success: true,
        } as const
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const response =
        (error?.response?.data as Record<string, number | string>) ?? {}

      if (
        response.errorCode ===
        'errors.com.epicgames.account.account_not_found'
      ) {
        try {
          const accessToken = await Authentication.verifyAccessToken(
            account,
            currentWindow
          )

          if (!accessToken) {
            return defaultResponse
          }

          for (const externalAuthType of ['xbl', 'psn'] as const) {
            const response = await findUserByExternalDisplayName({
              accessToken,
              displayName,
              externalAuthType,
            })

            if (response.data?.length > 0) {
              const current = response.data[0]

              if (current) {
                return {
                  data: {
                    ...current,
                    externalAuthType,
                    displayName:
                      current.externalAuths[externalAuthType]
                        ?.externalDisplayName ?? current.displayName,
                  },
                  errorMessage: null,
                  success: true,
                } as const
              }
            }
          }
        } catch (error) {
          //
        }

        defaultResponse.errorMessage = response.errorMessage
      }
    }

    return defaultResponse
  }
}
