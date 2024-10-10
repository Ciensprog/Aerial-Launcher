import type {
  MCPClaimDifficultyIncreaseRewardsResponse,
  MCPClaimMissionAlertRewardsResponse,
  MCPClaimQuestRewardResponse,
  MCPOpenCardPackBatchPayload,
  MCPOpenCardPackBatchResponse,
  MCPRecordCampaignMatchEndedResponse,
  MCPRedeemSTWAccoladeTokensResponse,
  MCPSetPinnedQuestsPayload,
  MCPSetPinnedQuestsResponse,
} from '../../types/services/mcp/claim-rewards'
import type { MCPHomebaseNameResponse } from '../../types/services/mcp/homebase-name'
import type {
  MCPActivateConsumableResponse,
  MCPClientQuestLoginResponse,
  MCPQueryProfile,
  MCPQueryProfileMainProfile,
} from '../../types/services/mcp'

import { baseGameService } from '../config/base-game'

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
        Authorization: `bearer ${accessToken}`,
      },
      params: {
        profileId: 'campaign',
        rvn: -1,
      },
    }
  )
}

export function getQueryProfileMainProfile({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return baseGameService.post<MCPQueryProfileMainProfile>(
    `/profile/${accountId}/client/QueryProfile`,
    {},
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
      params: {
        profileId: 'common_core',
        rvn: -1,
      },
    }
  )
}

export function getQueryPublicProfile({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return baseGameService.post<MCPQueryProfile>(
    `/profile/${accountId}/public/QueryPublicProfile`,
    {},
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
      params: {
        profileId: 'campaign',
        rvn: -1,
      },
    }
  )
}

export function setActivateConsumable({
  accessToken,
  accountId,
  targetItemId,
  targetAccountId,
}: {
  accessToken: string
  accountId: string
  targetItemId: string
  targetAccountId: string
}) {
  return baseGameService.post<MCPActivateConsumableResponse>(
    `/profile/${accountId}/client/ActivateConsumable`,
    {
      targetItemId,
      targetAccountId,
    },
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
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
        Authorization: `bearer ${accessToken}`,
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
        Authorization: `bearer ${accessToken}`,
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
        Authorization: `bearer ${accessToken}`,
      },
      params: {
        profileId: 'campaign',
        rvn: -1,
      },
    }
  )
}

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
        Authorization: `bearer ${accessToken}`,
      },
      params: {
        profileId: 'campaign',
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
        Authorization: `bearer ${accessToken}`,
      },
      params: {
        profileId: 'common_public',
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
        Authorization: `bearer ${accessToken}`,
      },
      params: {
        profileId: 'campaign',
        rvn: -1,
      },
    }
  )
}

export function setRecordCampaignMatchEnded({
  accessToken,
  accountId,
  sessionId,
}: {
  accessToken: string
  accountId: string
  sessionId: string
}) {
  return baseGameService.post<MCPRecordCampaignMatchEndedResponse>(
    `/profile/${accountId}/client/RecordCampaignMatchEnded`,
    {},
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
        'X-EpicGames-GameSessionId': sessionId,
      },
      params: {
        profileId: 'athena',
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
        Authorization: `bearer ${accessToken}`,
      },
      params: {
        profileId: 'athena',
        rvn: -1,
      },
    }
  )
}

export function setSetPinnedQuests({
  accessToken,
  accountId,
  pinnedQuestIds,
}: {
  accessToken: string
  accountId: string
} & MCPSetPinnedQuestsPayload) {
  return baseGameService.post<MCPSetPinnedQuestsResponse>(
    `/profile/${accountId}/client/SetPinnedQuests`,
    {
      pinnedQuestIds,
    } as MCPSetPinnedQuestsPayload,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
      params: {
        profileId: 'campaign',
        rvn: -1,
      },
    }
  )
}
