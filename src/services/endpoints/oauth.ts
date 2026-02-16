import type { AxiosRequestConfig } from 'axios'
import type {
  AuthorizationCodeResponse,
  CreateAccessTokenWithClientCredentialsResponse,
  CreateExchangeCodeResponse,
  DeviceAuthResponse,
  ExchangeCodeResponse,
  VerifyAccessTokenResponse,
} from '../../types/services/authorizations'

import { oauthService } from '../config/oauth'
import { publicAccountService } from '../config/public-account'

export function getAccessTokenUsingAuthorizationCode(code: string) {
  return oauthService.post<AuthorizationCodeResponse>('/token', {
    grant_type: 'authorization_code',
    code,
  })
}

export function getAccessTokenUsingExchangeCode(
  exchange_code: string,
  config?: AxiosRequestConfig,
) {
  return oauthService.post<ExchangeCodeResponse>(
    '/token',
    {
      grant_type: 'exchange_code',
      exchange_code,
    },
    config,
  )
}

export function createAccessTokenUsingExchange(
  {
    exchange_code,
    token_type,
  }: {
    exchange_code: string
    token_type?: string
  },
  config?: AxiosRequestConfig,
) {
  return oauthService.post<AuthorizationCodeResponse>(
    '/token',
    {
      grant_type: 'exchange_code',
      exchange_code,
      token_type,
    },
    config,
  )
}

export function getAccessTokenUsingDeviceAuth(
  {
    accountId,
    deviceId,
    secret,
    token_type,
  }: {
    accountId: string
    deviceId: string
    secret: string
    token_type?: string
  },
  config?: AxiosRequestConfig,
) {
  return oauthService.post<AuthorizationCodeResponse>(
    '/token',
    {
      secret,
      grant_type: 'device_auth',
      account_id: accountId,
      device_id: deviceId,
      token_type,
    },
    config,
  )
}

export function getExchangeCodeUsingAccessToken(accessToken: string) {
  return oauthService.get<CreateExchangeCodeResponse>('/exchange', {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  })
}

export function getExchangeCode(config: AxiosRequestConfig) {
  return oauthService.get<CreateExchangeCodeResponse>('/exchange', config)
}

export function createAccessTokenUsingClientCredentials({
  authorization,
}: {
  authorization: string
}) {
  return oauthService.post<CreateAccessTokenWithClientCredentialsResponse>(
    '/token',
    {
      grant_type: 'client_credentials',
    },
    {
      headers: {
        Authorization: `basic ${authorization}`,
      },
    },
  )
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
        Authorization: `bearer ${accessToken}`,
      },
    },
  )
}

export function oauthVerify(
  accessToken: string,
  config?: AxiosRequestConfig,
) {
  return oauthService.get<
    Omit<VerifyAccessTokenResponse, 'access_token'> & {
      token: string
    }
  >('/verify', {
    ...(config ?? {}),
    headers: {
      ...config?.headers,
      Authorization: `bearer ${accessToken}`,
    },
  })
}

export function killSession(token: string, config?: AxiosRequestConfig) {
  return oauthService.delete(`/sessions/kill/${token}`, config)
}
