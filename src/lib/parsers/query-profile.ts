import type { MCPQueryProfileChanges } from '../../types/services/mcp'

import { FounderEdition } from '../../config/constants/fortnite/founder'
import { isMCPQueryProfileChangesQuest } from '../check-objects'

export function extractBoostedXP(value?: MCPQueryProfileChanges) {
  const items = Object.values(value?.profile?.items ?? {})

  return (
    items.find((item) => item.templateId === 'Token:xpboost')?.quantity ??
    0
  )
}

export function extractXPBoosts(value?: MCPQueryProfileChanges) {
  const items = Object.entries(value?.profile?.items ?? {})
  const data = {
    personal: 0,
    teammate: 0,
  }

  items.forEach(([, item]) => {
    if (item.templateId === 'ConsumableAccountItem:smallxpboost') {
      data.personal = item.quantity
    } else if (
      item.templateId === 'ConsumableAccountItem:smallxpboost_gift'
    ) {
      data.teammate = item.quantity
    }
  })

  return data
}

export function extractFounderStatus(value?: MCPQueryProfileChanges) {
  const items = Object.values(value?.profile?.items ?? {})
  const isFounder = items.find(
    (item) => item.templateId === 'Token:receivemtxcurrency'
  )

  const founderType = {
    [FounderEdition.STANDARD]: false,
    [FounderEdition.DELUXE]: false,
    [FounderEdition.SUPER_DELUXE]: false,
    [FounderEdition.LIMITED]: false,
    [FounderEdition.ULTIMATE]: false,
  }

  items.forEach((item) => {
    if (
      isMCPQueryProfileChangesQuest(item) &&
      founderType[item.templateId as FounderEdition] !== undefined
    ) {
      founderType[item.templateId as FounderEdition] = true
    }
  })

  if (founderType[FounderEdition.ULTIMATE]) {
    return 'ultimate'
  }

  if (founderType[FounderEdition.LIMITED]) {
    return 'limited'
  }

  if (founderType[FounderEdition.SUPER_DELUXE]) {
    return 'super-deluxe'
  }

  if (founderType[FounderEdition.DELUXE]) {
    return 'deluxe'
  }

  if (founderType[FounderEdition.STANDARD]) {
    return 'standard'
  }

  return isFounder ? 'founder' : 'non-founder'
}

export function extractCommanderLevel(value?: MCPQueryProfileChanges) {
  const result = {
    baseLevel: 0,
    postLevel: 0,
    total: 0,
  }

  if (value) {
    const baseLevel = value.profile.stats.attributes.level ?? 0
    const postLevel =
      value.profile.stats.attributes.rewards_claimed_post_max_level ?? 0

    result.baseLevel = baseLevel
    result.postLevel = postLevel
    result.total = baseLevel + postLevel
  }

  return result
}
