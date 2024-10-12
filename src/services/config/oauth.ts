import type { AxiosRetry } from 'axios-retry'

import axios from 'axios'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const axiosRetry = require('axios-retry').default as AxiosRetry

import {
  defaultFortniteClient,
  fortniteIOSGameClient,
} from '../../config/fortnite/clients'

import { Manifest } from '../../kernel/core/manifest'

/**
 * OAuth Service
 */

export const oauthService = axios.create({
  baseURL:
    'https://account-public-service-prod.ol.epicgames.com/account/api/oauth',
})

axiosRetry(oauthService, {
  retries: 1,
  retryCondition(error) {
    const response =
      (error.response?.data as Record<string, number | string>) ?? {}

    return (
      response.error === 'invalid_grant' &&
      response.numericErrorCode === 18031
    )
  },
  onRetry(_retryCount, _error, requestConfig) {
    if (requestConfig.headers) {
      requestConfig.headers.Authorization = `basic ${fortniteIOSGameClient.auth}`
    }

    return
  },
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
