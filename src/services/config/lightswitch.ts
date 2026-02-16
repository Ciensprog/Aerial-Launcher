import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Lightswitch Service
 */

export const lightswitchService = axios.create({
  baseURL:
    'https://lightswitch-public-service-prod.ol.epicgames.com/lightswitch/api/service',
})

lightswitchService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
