import type {
  MCPQueryProfileProfileChangesCardPack,
  MCPQueryProfileProfileChangesConsumableAccountItem,
  MCPQueryProfileProfileChangesHero,
  MCPQueryProfileProfileChangesQuest,
  MCPQueryProfileProfileChangesSchematic,
  MCPQueryProfileProfileChangesToken,
  MCPQueryProfileProfileChangesWorker,
} from '../types/services/mcp'

export function isMCPQueryProfileChangesCardPack(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesCardPack {
  return value?.templateId?.startsWith('CardPack:')
}

export function isMCPQueryProfileChangesConsumableAccountItem(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesConsumableAccountItem {
  return value?.templateId?.startsWith('ConsumableAccountItem:')
}

export function isMCPQueryProfileChangesHero(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesHero {
  return value?.templateId?.startsWith('Hero:')
}

export function isMCPQueryProfileChangesSchematic(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesSchematic {
  return value?.templateId?.startsWith('Schematic:')
}

export function isMCPQueryProfileChangesToken(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesToken {
  return value?.templateId?.startsWith('Token:')
}

export function isMCPQueryProfileChangesQuest(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesQuest {
  return value?.templateId?.startsWith('Quest:')
}

export function isMCPQueryProfileChangesWorker(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesWorker {
  return value?.templateId?.startsWith('Worker:')
}
