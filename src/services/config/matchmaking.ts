import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Matchmaking Service
 */

export const matchmakingService = axios.create({
  baseURL:
    'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/matchmaking/session',
})

matchmakingService.interceptors.request.use((config) => {
  const manifest = Manifest.get()

  if (manifest) {
    config.headers.setUserAgent(manifest.UserAgent)
  }

  return config
})
