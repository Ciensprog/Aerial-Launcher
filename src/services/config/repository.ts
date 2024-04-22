import axios from 'axios'

import packageJson from '../../../package.json'

/**
 * Repository Service
 */

export const repositoryService = axios.create({
  baseURL: `https://api.github.com/repos/${packageJson.author.name}/Aerial-Launcher`,
})
