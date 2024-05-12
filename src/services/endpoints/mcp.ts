import type { MCPClientQuestLoginResponse } from '../../types/services/mcp'

import { mcpService } from '../config/mcp'

export function setClientQuestLogin({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return mcpService.post<MCPClientQuestLoginResponse>(
    `/${accountId}/client/ClientQuestLogin`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        profileId: 'campaign',
        rvn: -1,
      },
    }
  )
}
