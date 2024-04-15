import axios from 'axios'

/**
 * Public Account Service
 */

export const publicAccountService = axios.create({
  baseURL:
    'https://account-public-service-prod.ol.epicgames.com/account/api/public/account',
})
