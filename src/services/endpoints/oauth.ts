import type { AxiosRequestConfig } from 'axios'
import type {
  AuthorizationCodeResponse,
  DeviceAuthResponse,
  ExchangeCodeResponse,
} from '../../types/services/authorizations'

import { oauthService } from '../config/oauth'
import { publicAccountService } from '../config/public-account'

export function getAccessTokenUsingAuthorizationCode(code: string) {
  return oauthService.post<AuthorizationCodeResponse>('/token', {
    grant_type: 'authorization_code',
    code,
  })
}

export function getAccessTokenUsingExchangeCode(exchange_code: string) {
  return oauthService.post<ExchangeCodeResponse>('/token', {
    grant_type: 'exchange_code',
    exchange_code,
  })
}

export function getAccessTokenUsingDeviceAuth({
  accountId,
  deviceId,
  secret,
}: {
  accountId: string
  deviceId: string
  secret: string
}) {
  return oauthService.post<AuthorizationCodeResponse>('/token', {
    secret,
    grant_type: 'device_auth',
    account_id: accountId,
    device_id: deviceId,
  })
}

export function createDeviceAuthCredentials({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return publicAccountService.post<DeviceAuthResponse>(
    `/${accountId}/deviceAuth`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
}

export function oauthVerify(
  accessToken: string,
  config?: AxiosRequestConfig
) {
  return oauthService.get<
    Omit<AuthorizationCodeResponse, 'access_token'> & {
      token: string
    }
  >('/verify', {
    ...(config ?? {}),
    headers: {
      ...config?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
