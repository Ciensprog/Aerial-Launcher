import type {
  MCPQueryProfileProfileChangesCardPack,
  MCPQueryProfileProfileChangesConsumableAccountItem,
  MCPQueryProfileProfileChangesHero,
  MCPQueryProfileProfileChangesQuest,
  MCPQueryProfileProfileChangesSchematic,
  MCPQueryProfileProfileChangesWorker,
} from '../types/services/mcp'

export function isMCPQueryProfileProfileChangesCardPack(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesCardPack {
  return value?.templateId?.startsWith('CardPack:')
}

export function isMCPQueryProfileProfileChangesConsumableAccountItem(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesConsumableAccountItem {
  return value?.templateId?.startsWith('ConsumableAccountItem:')
}

export function isMCPQueryProfileProfileChangesHero(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesHero {
  return value?.templateId?.startsWith('Hero:')
}

export function isMCPQueryProfileProfileChangesSchematic(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesSchematic {
  return value?.templateId?.startsWith('Schematic:')
}

export function isMCPQueryProfileProfileChangesQuest(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesQuest {
  return value?.templateId?.startsWith('Quest:')
}

export function isMCPQueryProfileProfileChangesWorker(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesWorker {
  return value?.templateId?.startsWith('Worker:')
}
