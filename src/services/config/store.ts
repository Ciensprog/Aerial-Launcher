import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Store Access Service
 */

export const storeAccessService = axios.create({
  // Without a timeout a hung request blocks bulk operations forever
  timeout: 30_000,
  baseURL:
    'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/storeaccess/v1',
})

storeAccessService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
