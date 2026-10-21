import type {
  XPBoostsSearchUserConfig,
  XPBoostsSearchUserData,
} from '../../types/xpboosts'
import type { LookupExternalAuthType } from '../../types/services/lookup'

import { Authentication } from './authentication'

import {
  findUserByAccountId,
  findUserByDisplayName,
  findUserByExternalDisplayName,
} from '../../services/endpoints/lookup'

const EXTERNAL_AUTH_PREFIXES = [
  'psn',
  'xbl',
  'nintendo',
  'steam',
] as const satisfies ReadonlyArray<LookupExternalAuthType>

function parseLookupQuery(displayName: string): {
  externalAuthType: LookupExternalAuthType | null
  value: string
} {
  const trimmed = displayName.trim()
  const separatorIndex = trimmed.indexOf(':')

  if (separatorIndex <= 0) {
    return {
      externalAuthType: null,
      value: trimmed,
    }
  }

  const prefix = trimmed.slice(0, separatorIndex).toLowerCase()
  const value = trimmed.slice(separatorIndex + 1).trim()

  if (
    (EXTERNAL_AUTH_PREFIXES as ReadonlyArray<string>).includes(prefix) &&
    value.length > 0
  ) {
    return {
      externalAuthType: prefix as LookupExternalAuthType,
      value,
    }
  }

  return {
    externalAuthType: null,
    value: trimmed,
  }
}

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

      const query = parseLookupQuery(displayName)

      if (query.externalAuthType) {
        const externalUser = await LookupManager.findByExternalAuth({
          accessToken,
          displayName: query.value,
          externalAuthType: query.externalAuthType,
        })

        if (externalUser) {
          return {
            data: externalUser,
            errorCode: null,
            errorMessage: null,
            success: true,
          } as const
        }

        return defaultResponse
      }

      if (query.value.length >= 28 && query.value.length <= 34) {
        try {
          const response = await findUserByAccountId({
            accessToken,
            accountId: query.value,
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
        displayName: query.value,
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

          const query = parseLookupQuery(displayName)

          for (const externalAuthType of ['xbl', 'psn'] as const) {
            const externalUser = await LookupManager.findByExternalAuth({
              accessToken,
              displayName: query.value,
              externalAuthType,
            })

            if (externalUser) {
              return {
                data: externalUser,
                errorCode: null,
                errorMessage: null,
                success: true,
              } as const
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

  private static async findByExternalAuth({
    accessToken,
    displayName,
    externalAuthType,
  }: {
    accessToken: string
    displayName: string
    externalAuthType: LookupExternalAuthType
  }): Promise<XPBoostsSearchUserData['lookup'] | null> {
    try {
      const response = await findUserByExternalDisplayName({
        accessToken,
        displayName,
        externalAuthType,
      })

      if (response.data?.length > 0) {
        const current = response.data[0]

        if (current) {
          const externalDisplayName =
            current.externalAuths[externalAuthType]?.externalDisplayName ??
            current.displayName

          return {
            ...current,
            externalAuthType:
              externalAuthType === 'psn' || externalAuthType === 'xbl'
                ? externalAuthType
                : undefined,
            displayName: current.displayName || externalDisplayName,
          }
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    return null
  }
}
