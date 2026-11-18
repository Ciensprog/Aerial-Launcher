import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Caldera Service
 */

export const calderaService = axios.create({
  // Without a timeout a hung request blocks bulk operations forever
  timeout: 30_000,
  baseURL:
    'https://caldera-service-prod.ecosec.on.epicgames.com/caldera/api/v1/launcher',
})

calderaService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
