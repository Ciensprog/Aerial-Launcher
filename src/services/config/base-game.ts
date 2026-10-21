import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'
import { resolveGameServiceMcpHost } from '../../lib/epic/mcp-game'

/**
 * Base Game Service
 */

export const baseGameService = axios.create({
  baseURL: 'https://mcp-gc.live.fngw.ol.epicgames.com/fortnite/api/game/v2',
})

baseGameService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()
  const host = await resolveGameServiceMcpHost()

  config.baseURL = `https://${host}/fortnite/api/game/v2`
  config.headers.setUserAgent(userAgent)

  return config
})
