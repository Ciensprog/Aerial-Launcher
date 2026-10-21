import axios from 'axios'

import { Manifest } from '../../kernel/core/manifest'

export const cloudStorageService = axios.create({
  baseURL:
    'https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/cloudstorage',
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
})

cloudStorageService.interceptors.request.use(async (config) => {
  const userAgent = await Manifest.getUserAgent()

  config.headers.setUserAgent(userAgent)

  return config
})
