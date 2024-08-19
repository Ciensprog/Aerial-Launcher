import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Matchmaking Service
 */

export const matchmakingService = axios.create({
  baseURL:
    'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/matchmaking/session',
})

matchmakingService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
