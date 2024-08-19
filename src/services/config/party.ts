import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Party Service
 */

export const partyService = axios.create({
  baseURL:
    'https://party-service-prod.ol.epicgames.com/party/api/v1/Fortnite',
})

partyService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
