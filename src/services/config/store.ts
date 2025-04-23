import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Store Access Service
 */

export const storeAccessService = axios.create({
  baseURL:
    'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/storeaccess/v1',
})

storeAccessService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
