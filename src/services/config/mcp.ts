import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * MCP Service
 */

export const mcpService = axios.create({
  baseURL:
    'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/game/v2/profile',
})

mcpService.interceptors.request.use((config) => {
  const manifest = Manifest.get()

  if (manifest) {
    config.headers.setUserAgent(manifest.UserAgent)
  }

  return config
})
