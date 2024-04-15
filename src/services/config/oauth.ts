import axios from 'axios'

import { defaultFortniteClient } from '../../config/fortnite/clients'

/**
 * OAuth Service
 */

export const oauthService = axios.create({
  baseURL:
    'https://account-public-service-prod.ol.epicgames.com/account/api/oauth',
})

oauthService.interceptors.request.use((config) => {
  if (!config.headers.getAuthorization()) {
    /**
     * Load Authorization header with default client on every request
     */
    config.headers.setAuthorization(
      `Basic ${defaultFortniteClient.use.auth}`
    )
  }

  config.headers.setContentType('application/x-www-form-urlencoded')

  return config
})
