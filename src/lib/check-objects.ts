import type {
  MCPQueryProfileProfileChangesCardPack,
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

export function isMCPQueryProfileProfileChangesHero(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesHero {
  return value?.templateId?.startsWith('Hero:')
}

export function isMCPQueryProfileProfileChangesQuest(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesQuest {
  return value?.templateId?.startsWith('Quest:')
}

export function isMCPQueryProfileProfileChangesSchematic(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesSchematic {
  return value?.templateId?.startsWith('Schematic:')
}

export function isMCPQueryProfileProfileChangesWorker(value: {
  templateId: string
}): value is MCPQueryProfileProfileChangesWorker {
  return value?.templateId?.startsWith('Worker:')
}
