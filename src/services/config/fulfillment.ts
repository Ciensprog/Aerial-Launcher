import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Fulfillment Service
 */

export const fulfillmentService = axios.create({
  baseURL:
    'https://fulfillment-public-service-prod.ol.epicgames.com/fulfillment/api/public',
})

fulfillmentService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
