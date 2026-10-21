import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Presence Service
 */

export const presenceService = axios.create({
  baseURL:
    'https://presence-public-service-prod.ol.epicgames.com/presence/api/v1/_',
})

presenceService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
