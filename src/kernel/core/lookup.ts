import type { AccountData } from '../../types/accounts'

import { Authentication } from './authentication'

import { findUserByDisplayName } from '../../services/endpoints/lookup'

export class LookupManager {
  static async searchUserByDisplayName({
    account,
    displayName,
  }: {
    account: AccountData
    displayName: string
  }) {
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
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        return defaultResponse
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
        defaultResponse.errorMessage = response.errorMessage
      }
    }

    return defaultResponse
  }
}
