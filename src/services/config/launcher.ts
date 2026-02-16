import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

/**
 * Launcher Service
 */

export const launcherService = axios.create({
  baseURL:
    'https://launcher-public-service-prod.ol.epicgames.com/launcher/api',
})

launcherService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})

export const launcherAvailablePlatforms = {
  Android: 'Android',
  IOS: 'IOS',
  PS4: 'PS4',
  PS5: 'PS5',
  Switch: 'Switch',
  Switch2: 'Switch2',
  XB1: 'XB1',
  XSX: 'XSX',
  Windows: 'Windows',
} as const
