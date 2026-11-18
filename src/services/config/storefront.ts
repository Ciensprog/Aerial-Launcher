import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Storefront Service
 */

export const storefrontService = axios.create({
  // Without a timeout a hung request blocks bulk operations forever
  timeout: 30_000,
  baseURL:
    'https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/storefront/v2',
})

storefrontService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
