import axios from 'axios'

export const fortniteApiService = axios.create({
  baseURL: 'https://fortnite-api.com',
  timeout: 15000,
  headers: {
    'User-Agent': 'AerialLauncher-ItemShop/1.0',
  },
})
