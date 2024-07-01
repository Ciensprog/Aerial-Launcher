import type {
  MCPClaimDifficultyIncreaseRewardsResponse,
  MCPClaimMissionAlertRewardsResponse,
  MCPClaimQuestRewardResponse,
  MCPOpenCardPackBatchPayload,
  MCPOpenCardPackBatchResponse,
  MCPRedeemSTWAccoladeTokensResponse,
} from '../../types/services/mcp/claim-rewards'
import type {
  MCPClientQuestLoginResponse,
  MCPQueryProfile,
} from '../../types/services/mcp'

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

export function getQueryProfile({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return mcpService.post<MCPQueryProfile>(
    `/${accountId}/client/QueryProfile`,
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

export function setOpenCardPackBatch({
  accessToken,
  accountId,
  cardPackItemIds,
}: {
  accessToken: string
  accountId: string
} & MCPOpenCardPackBatchPayload) {
  return mcpService.post<MCPOpenCardPackBatchResponse>(
    `/${accountId}/client/OpenCardPackBatch`,
    {
      cardPackItemIds,
    } as MCPOpenCardPackBatchPayload,
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

export function setClaimQuestReward({
  accessToken,
  accountId,
  questId,
}: {
  accessToken: string
  accountId: string
  questId: string
}) {
  return mcpService.post<MCPClaimQuestRewardResponse>(
    `/${accountId}/client/ClaimQuestReward`,
    {
      questId,
      selectedRewardIndex: 0,
    },
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

export function setClaimMissionAlertRewards({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return mcpService.post<MCPClaimMissionAlertRewardsResponse>(
    `/${accountId}/client/ClaimMissionAlertRewards`,
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

export function setClaimDifficultyIncreaseRewards({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return mcpService.post<MCPClaimDifficultyIncreaseRewardsResponse>(
    `/${accountId}/client/ClaimDifficultyIncreaseRewards`,
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

export function setRedeemSTWAccoladeTokens({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return mcpService.post<MCPRedeemSTWAccoladeTokensResponse>(
    `/${accountId}/client/RedeemSTWAccoladeTokens`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        profileId: 'athena',
        rvn: -1,
      },
    }
  )
}
