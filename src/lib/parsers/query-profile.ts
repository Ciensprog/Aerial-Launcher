import type { MCPQueryProfileChanges } from '../../types/services/mcp'

import { FounderEdition } from '../../config/constants/fortnite/founder'
import { isMCPQueryProfileChangesQuest } from '../check-objects'

export function extractBoostedXP(value: MCPQueryProfileChanges) {
  const items = Object.values(value?.profile?.items ?? {})

  return (
    items.find((item) => item.templateId === 'Token:xpboost')?.quantity ??
    0
  )
}

export function extractFounderStatus(value: MCPQueryProfileChanges) {
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
    return 'Ultimate Edition'
  }

  if (founderType[FounderEdition.LIMITED]) {
    return 'Limited Edition'
  }

  if (founderType[FounderEdition.SUPER_DELUXE]) {
    return 'Super Deluxe Edition'
  }

  if (founderType[FounderEdition.DELUXE]) {
    return 'Deluxe Edition'
  }

  if (founderType[FounderEdition.STANDARD]) {
    return 'Standard Edition'
  }

  return isFounder ? 'Founder' : 'Non-Founder'
}
