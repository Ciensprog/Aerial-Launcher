import axios from 'axios'

/**
 * Caldera Service
 */

export const calderaService = axios.create({
  baseURL:
    'https://caldera-service-prod.ecosec.on.epicgames.com/caldera/api/v1/launcher',
})
