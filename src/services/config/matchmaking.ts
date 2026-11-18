import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Matchmaking Service
 */

export const matchmakingService = axios.create({
  // Without a timeout a hung request blocks bulk operations forever
  timeout: 30_000,
  baseURL:
    'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/matchmaking/session',
})

matchmakingService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
