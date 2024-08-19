import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Caldera Service
 */

export const calderaService = axios.create({
  baseURL:
    'https://caldera-service-prod.ecosec.on.epicgames.com/caldera/api/v1/launcher',
})

calderaService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
