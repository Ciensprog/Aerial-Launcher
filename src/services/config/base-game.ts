import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Base Game Service
 */

export const baseGameService = axios.create({
  baseURL:
    'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/game/v2',
})

baseGameService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
