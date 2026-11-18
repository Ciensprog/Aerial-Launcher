import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Public Account Service
 */

export const publicAccountService = axios.create({
  // Without a timeout a hung request blocks bulk operations forever
  timeout: 30_000,
  baseURL:
    'https://account-public-service-prod.ol.epicgames.com/account/api/public/account',
})

publicAccountService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
