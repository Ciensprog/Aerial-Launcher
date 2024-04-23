import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Public Account Service
 */

export const publicAccountService = axios.create({
  baseURL:
    'https://account-public-service-prod.ol.epicgames.com/account/api/public/account',
})

publicAccountService.interceptors.request.use((config) => {
  const manifest = Manifest.get()

  if (manifest) {
    config.headers.setUserAgent(manifest.UserAgent)
  }

  return config
})
