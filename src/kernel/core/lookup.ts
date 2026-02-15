import type {
  XPBoostsSearchUserConfig,
  XPBoostsSearchUserData,
} from '../../types/xpboosts'

import { Authentication } from './authentication'

import {
  findUserByAccountId,
  findUserByDisplayName,
  findUserByExternalDisplayName,
} from '../../services/endpoints/lookup'

export class LookupManager {
  static async searchUserByDisplayName({
    account,
    displayName,
  }: Pick<XPBoostsSearchUserConfig, 'account' | 'displayName'>): Promise<
    | {
        data: null
        success: false
        errorCode: number | string | null
        errorMessage: number | string | null
      }
    | {
        data: XPBoostsSearchUserData['lookup']
        success: true
        errorCode: number | string | null
        errorMessage: number | string | null
      }
  > {
    const defaultResponse: {
      data: null
      success: false
      errorCode: number | string | null
      errorMessage: number | string | null
    } = {
      data: null,
      success: false,
      errorCode: null,
      errorMessage: null,
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

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
              errorCode: null,
              errorMessage: null,
              success: true,
            } as const
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          errorCode: null,
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
          const accessToken =
            await Authentication.verifyAccessToken(account)

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
                  errorCode: null,
                  errorMessage: null,
                  success: true,
                } as const
              }
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          //
        }

        defaultResponse.errorCode =
          response.errorCode?.split('.')?.at(-1) ?? 'UNKNOWN'
        defaultResponse.errorMessage = response.errorMessage
      }
    }

    return defaultResponse
  }
}
