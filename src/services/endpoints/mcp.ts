import type {
  MCPClaimDifficultyIncreaseRewardsResponse,
  MCPClaimMissionAlertRewardsResponse,
  MCPClaimQuestRewardResponse,
  MCPOpenCardPackBatchPayload,
  MCPOpenCardPackBatchResponse,
  MCPRedeemSTWAccoladeTokensResponse,
} from '../../types/services/mcp/claim-rewards'
import type { MCPHomebaseNameResponse } from '../../types/services/mcp/homebase-name'
import type {
  MCPClientQuestLoginResponse,
  MCPQueryProfile,
} from '../../types/services/mcp'

import { baseGameService } from '../config/base-game'

export function setClientQuestLogin({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return baseGameService.post<MCPClientQuestLoginResponse>(
    `/profile/${accountId}/client/ClientQuestLogin`,
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
  return baseGameService.post<MCPQueryProfile>(
    `/profile/${accountId}/client/QueryProfile`,
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
  return baseGameService.post<MCPOpenCardPackBatchResponse>(
    `/profile/${accountId}/client/OpenCardPackBatch`,
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
  return baseGameService.post<MCPClaimQuestRewardResponse>(
    `/profile/${accountId}/client/ClaimQuestReward`,
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
  return baseGameService.post<MCPClaimMissionAlertRewardsResponse>(
    `/profile/${accountId}/client/ClaimMissionAlertRewards`,
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
  return baseGameService.post<MCPClaimDifficultyIncreaseRewardsResponse>(
    `/profile/${accountId}/client/ClaimDifficultyIncreaseRewards`,
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
  return baseGameService.post<MCPRedeemSTWAccoladeTokensResponse>(
    `/profile/${accountId}/client/RedeemSTWAccoladeTokens`,
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

export function setHomebaseName({
  accessToken,
  accountId,
  homebaseName,
}: {
  accessToken: string
  accountId: string
  homebaseName: string
}) {
  return baseGameService.post<MCPHomebaseNameResponse>(
    `/profile/${accountId}/client/SetHomebaseName`,
    {
      homebaseName,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        profileId: 'common_public',
        rvn: -1,
      },
    }
  )
}
