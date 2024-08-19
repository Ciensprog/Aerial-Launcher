import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Friends Service
 */

export const friendsService = axios.create({
  baseURL:
    'https://friends-public-service-prod.ol.epicgames.com/friends/api/v1',
})

friendsService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
