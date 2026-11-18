import axios from 'axios'

import packageJson from '../../../package.json'

/**
 * Repository Service
 */

export const repositoryService = axios.create({
  // Without a timeout a hung request blocks bulk operations forever
  timeout: 30_000,
  baseURL: `https://api.github.com/repos/${packageJson.author.name}/Aerial-Launcher`,
})
