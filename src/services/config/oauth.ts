import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

import axios from 'axios'

import {
  defaultFortniteClient,
  fortniteIOSGameClient,
} from '../../config/fortnite/clients'

import { Manifest } from '../../kernel/core/manifest'

/**
 * OAuth Service
 */

export const oauthService = axios.create({
  // Without a timeout a hung request blocks bulk operations forever
  timeout: 30_000,
  baseURL:
    'https://account-public-service-prod.ol.epicgames.com/account/api/oauth',
})

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  grantSwapRetried?: boolean
}

oauthService.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableRequestConfig | undefined

  const response = (error.response?.data ?? {}) as Record<
    string,
    number | string
  >

  if (
    !config ||
    config.grantSwapRetried ||
    response.error !== 'invalid_grant' ||
    response.numericErrorCode !== 18031
  ) {
    throw error
  }

  config.grantSwapRetried = true
  config.headers.setAuthorization(`basic ${fortniteIOSGameClient.auth}`)

  return oauthService.request(config)
})

oauthService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  if (!config.headers.getAuthorization()) {
    /**
     * Load Authorization header with default client on every request
     */
    config.headers.setAuthorization(
      `basic ${defaultFortniteClient.use.auth}`
    )
  }

  config.headers.setContentType('application/x-www-form-urlencoded')

  return config
})
