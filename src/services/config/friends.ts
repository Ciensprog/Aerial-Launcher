import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Friends Service
 */

export const friendsService = axios.create({
  baseURL:
    'https://friends-public-service-prod.ol.epicgames.com/friends/api/v1',
})

friendsService.interceptors.request.use((config) => {
  const manifest = Manifest.get()

  if (manifest) {
    config.headers.setUserAgent(manifest.UserAgent)
  }

  return config
})
