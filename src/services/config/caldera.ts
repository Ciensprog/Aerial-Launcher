import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Caldera Service
 */

export const calderaService = axios.create({
  baseURL:
    'https://caldera-service-prod.ecosec.on.epicgames.com/caldera/api/v1/launcher',
})

calderaService.interceptors.request.use((config) => {
  const manifest = Manifest.get()

  if (manifest) {
    config.headers.setUserAgent(manifest.UserAgent)
  }

  return config
})
