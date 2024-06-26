export type ProfileId = 'campaign' | (string & Record<string, unknown>)

export type MCPQueryProfile = {
  profileRevision: number
  profileId: ProfileId
  profileChangesBaseRevision: number
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
  profileChanges: Array<MCPQueryProfileProfileChanges>
}

export type MCPQueryProfileProfileChanges = {
  changeType: 'fullProfileUpdate' | (string & Record<string, unknown>)
  profile: {
    _id: string
    created: string
    updated: string
    rvn: number
    wipeNumber: number
    accountId: string
    profileId: ProfileId
    version: string
    commandRevision: number
    stats: {
      attributes: {
        node_costs: {
          homebase_node_default_page: {
            'Token:homebasepoints': number
          }
          research_node_default_page: {
            'Token:collectionresource_nodegatetoken01': number
          }
        }
        mission_alert_redemption_record: {
          claimData: Array<{
            missionAlertId: string
            evictClaimDataAfterUtc: string
            redemptionDateUtc: string
          }>
          pendingMissionAlertRewards: {
            tierGroupName:
              | 'MissionAlert_Storm:4'
              | (string & Record<string, unknown>)
            items: Array<{
              itemType: string
              quantity: number
            }>
          }
        }
        rewards_claimed_post_max_level: number
        client_settings: {
          pinnedQuestInstances: Array<string>
        }
        research_levels: {
          technology: number
          offense: number
          fortitude: number
          resistance: number
        }
        selected_hero_loadout: string
        level: number
        xp_overflow: number
        collection_book: {
          maxBookXpLevelAchieved: number
        }
        latent_xp_marker: string
        mfa_reward_claimed: boolean
        quest_manager: {
          dailyLoginInterval: string
          dailyQuestRerolls: number
          questPoolStats: {
            dailyLoginInterval: string
            poolLockouts: {
              poolLockouts: Array<{
                lockoutName:
                  | 'EnduranceDaily'
                  | 'Weekly'
                  | (string & Record<string, unknown>)
              }>
            }
            poolStats: Array<{
              questHistory: Array<string>
              rerollsRemaining: number
              nextRefresh: string
              poolName:
                | 'dailywargamescanny_01'
                | 'dailywargameschallenge_01'
                | 'dailywargamesplankerton_01'
                | 'dailywargamesstonewood_01'
                | 'dailywargamestwine_01'
                | 'endurancedailyquests_15'
                | 'holdfastdaily_part1_01'
                | 'holdfastdaily_part2_01'
                | 'hordev3dailyquests_01'
                | 'maydaydailyquest_01'
                | 'starlightdailyquest_01'
                | 'stormkingdailyquest_01'
                | 'weeklyelderquestroll_01'
                | 'weeklyquestroll_23'
                | 'weeklystormkinghardroll_01'
                | (string & Record<string, unknown>)
            }>
          }
        }
        legacy_research_points_spent: number
        gameplay_stats: Array<{
          statName:
            | 'habaneroprogression'
            | 'zonescompleted'
            | (string & Record<string, unknown>)
          statValue: number
        }>
        event_currency: {
          cf: number
          templateId:
            | 'AccountResource:eventcurrency_roadtrip'
            | (string & Record<string, unknown>)
        }
        matches_played: number
        xp_lost: number
        mode_loadouts: Array<unknown>
        unslot_mtx_spend: number
        daily_rewards: {
          nextDefaultReward: number
          totalDaysLoggedIn: number
          lastClaimDate: string
          additionalSchedules: {
            founderspackdailyrewardtoken: {
              rewardsClaimed: number
              claimedToday: boolean
            }
          }
        }
        xp: number
        quest_completion_session_ids: Record<string, string>
        difficulty_increase_rewards_record: {
          pendingRewards: Array<{
            difficultyIncreaseMissionRewards: {
              tierGroupName:
                | 'BluGloDifficultyTG:4'
                | (string & Record<string, unknown>)
              items: Array<{
                itemType: string
                quantity: number
              }>
            }
            difficultyIncreaseTier: number
          }>
        }
        packs_granted: number
      }
    }
    items: Record<
      string,
      | MCPQueryProfileProfileChangesCardPack
      | MCPQueryProfileProfileChangesHero
      | MCPQueryProfileProfileChangesQuest
      | MCPQueryProfileProfileChangesSchematic
      | MCPQueryProfileProfileChangesWorker
    >
  }
}

export type MCPQueryProfileProfileChangesCardPack = {
  templateId: `CardPack:${string}`
  attributes: {
    match_statistics?: {
      mission_name: string
      total_seconds_in_match: number
      matchmaking_session_id: string
      eligibility_status: 'None' | (string & Record<string, unknown>)
    }
    level: number
    pack_source: string
  }
  quantity: number
}

export type MCPQueryProfileProfileChangesHero = {
  templateId: `Hero:${string}`
  attributes: {
    hero_name: 'DefaultHeroName' | (string & Record<string, unknown>)
    level: number
    item_seen: boolean
    squad_slot_idx: number
    building_slot_used: number
    favorite?: boolean
    max_level_bonus?: number
    refundable?: boolean
    outfitvariants?: Array<{
      channel: 'Parts' | (string & Record<string, unknown>)
      active:
        | 'CampaignHero.Tier2.Legendary'
        | 'CampaignHero.Tier3.Legendary'
        | (string & Record<string, unknown>)
    }>
    backblingvariants?: Array<{
      channel: 'Parts' | (string & Record<string, unknown>)
      active:
        | 'CampaignHero.Tier2.Legendary'
        | 'CampaignHero.Tier3.Legendary'
        | (string & Record<string, unknown>)
    }>
    mode_loadouts?: Array<unknown>
  }
  quantity: number
}

export type MCPQueryProfileProfileChangesQuest = {
  templateId: `Quest:${string}`
  attributes: {
    quest_state: 'Claimed' | (string & Record<string, unknown>)
    creation_time: 'min' | (string & Record<string, unknown>)
    last_state_change_time: string
    level: number
    item_seen: boolean
    sent_new_notification: boolean
    quest_rarity: 'uncommon' | (string & Record<string, unknown>)
    xp_reward_scalar: number
  }
  quantity: number
}

export type MCPQueryProfileProfileChangesSchematic = {
  templateId: `Schematic:${string}`
  attributes: {
    level: number
    max_level_bonus?: number
    item_seen: boolean
    favorite?: boolean
    alterations: Array<
      `Alteration:${string}` | (string & Record<string, unknown>)
    >
    alteration_base_rarities?: Array<
      'common' | 'uncommon' | 'rare' | (string & Record<string, unknown>)
    >
    refund_legacy_item?: boolean
  }
  quantity: number
}

export type MCPQueryProfileProfileChangesWorker = {
  templateId: `Worker:${string}`
  attributes: {
    personality: 'string'
    gender?: '1' | '2' | (string & Record<string, unknown>)
    level: number
    max_level_bonus?: number
    favorite?: boolean
    item_seen: boolean
    squad_id?: number
    squad_slot_idx: number
    portrait: string
    building_slot_used: number
    set_bonus?: string
    managerSynergy?: string
  }
  quantity: number
}
