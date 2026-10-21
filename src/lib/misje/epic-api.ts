import { getWorldInfoData } from '../../services/endpoints/advanced-mode/world-info'
import {
  getFortnitePcUserAccessToken,
  invalidateFortnitePcUserAccessToken,
} from '../epic/mcp-game'

export async function fetchWorldInfoEnglish(): Promise<unknown> {
  try {
    return await downloadWorldInfo()
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response
      ?.status
    if (status === 401) {
      invalidateFortnitePcUserAccessToken()
      return downloadWorldInfo()
    }
    throw error
  }
}

async function downloadWorldInfo(): Promise<unknown> {
  const token = await getFortnitePcUserAccessToken()
  const response = await getWorldInfoData({
    accessToken: token,
  })
  return response.data
}
