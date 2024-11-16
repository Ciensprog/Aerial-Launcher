import type { WorldInfoMission } from '../../types/data/advanced-mode/world-info'

import {
  modifiersAvailable,
  WorldModifier,
} from '../../config/constants/fortnite/world-info'
import {
  RarityType,
  ingredientsJson,
  rarities,
  resourcesJson,
  survivorsMythicLeadsJson,
} from '../../config/constants/resources'

import {
  imgCurrency,
  imgIngredients,
  imgModifiers,
  imgRarities,
  imgResources,
  imgSurvivorsMythicLeads,
  imgWorld,
} from '../repository'

type ParseModifierData =
  WorldInfoMission['ui']['mission']['modifiers'][number]
type ParseResourceData = {
  imgUrl: string
  itemType: string
  key: string
  name: string
  quantity: number
}

function getKey<Data = unknown>(
  key: string,
  resource: Record<string, Data>
) {
  return Object.entries(resource).find(([id]) => key.includes(id))
}

export function parseModifier(key: string) {
  const data: ParseModifierData = {
    id: key,
    imageUrl: imgWorld('question.png'),
  }
  const newKey = `${key}`.replace('GameplayModifier:', '')

  if (modifiersAvailable.includes(newKey as WorldModifier)) {
    data.imageUrl = imgModifiers(`${newKey}.png`)
  }

  return data
}

export function parseResource({
  key,
  quantity,
}: {
  key: string
  quantity: number
}) {
  const newKey = key
    .replace(/_((very)?low|medium|(very)?high|extreme)$/gi, '')
    .replace('AccountResource:', '')
    .replace('CardPack:zcp_', '')
  const rarity = parseRarity(newKey)
  const data: ParseResourceData = {
    key,
    quantity,
    imgUrl: imgRarities(`${rarity.rarity}.png`),
    itemType: key,
    name: rarity.type,
  }

  const resource = getKey(newKey, resourcesJson)

  if (resource) {
    const resourceId = resource[0]
    const isEventCurrency =
      (newKey !== 'eventcurrency_scaling' &&
        newKey !== 'eventcurrency_founders' &&
        newKey.startsWith('eventcurrency_')) ||
      newKey === 'campaign_event_currency'
    const typeFn = isEventCurrency ? imgCurrency : imgResources
    const isUnknownTickets = [
      'campaign_event_currency',
      'eventcurrency_spring',
      'eventcurrency_summer',
    ]
    const extension = isUnknownTickets.includes(resourceId) ? 'gif' : 'png'

    data.imgUrl = typeFn(`${resourceId}.${extension}`)
    data.name = resource[1].name

    return data
  }

  const ingredient = getKey(newKey, ingredientsJson)

  if (ingredient) {
    const [ingredientId, ingredientData] = ingredient

    data.imgUrl = imgIngredients(`${ingredientId}.png`)
    data.name = ingredientData.name

    return data
  }

  const survivor = getKey(newKey, survivorsMythicLeadsJson)
  const isWorker = newKey.startsWith('Worker:')

  if (survivor || isWorker) {
    if (survivor) {
      const [survivorId] = survivor

      data.imgUrl = imgSurvivorsMythicLeads(`${survivorId}.png`)
      data.name = `${rarities.er} Lead`
    } else {
      data.imgUrl = imgResources(
        `voucher_generic_${newKey.includes('manager') ? 'manager' : 'worker'}_${rarity.rarity}.png`
      )
      data.name = `${rarities[rarity.rarity]} Survivor`
    }

    return data
  }

  const isHero = newKey.startsWith('Hero:')

  if (isHero) {
    data.imgUrl = imgResources(`voucher_generic_hero_${rarity.rarity}.png`)
    data.name = `${rarities[rarity.rarity]} Hero`

    return data
  }

  const isDefender = newKey.startsWith('Defender:')

  if (isDefender) {
    data.imgUrl = imgResources(
      `voucher_generic_defender_${rarity.rarity}.png`
    )
    data.name = `${rarities[rarity.rarity]} Defender`

    return data
  }

  const isSchematic = newKey.startsWith('Schematic:')

  if (isSchematic) {
    data.imgUrl = imgResources(
      `voucher_generic_schematic_${rarity.rarity}.png`
    )
    data.name = `${rarities[rarity.rarity]} Schematic`

    return data
  }

  return data
}

export function parseRarity(value: string) {
  const type = value.split(':')[0]
  const id = value.includes(':') ? value.split(':')[1] : value
  const data = {
    type,
    name: rarities[RarityType.Common],
    rarity: RarityType.Common,
  }

  const setRarity = (type: RarityType) => {
    data.name = rarities[type]
    data.rarity = type
  }

  const conditionalEndsWith =
    id.endsWith(`_${RarityType.Common}`) ||
    id.endsWith(`_${RarityType.Uncommon}`) ||
    id.endsWith(`_${RarityType.Rare}`) ||
    id.endsWith(`_${RarityType.Epic}`) ||
    id.endsWith(`_${RarityType.Legendary}`)
  const conditionalIncludes =
    id.includes(`_${RarityType.Common}_`) ||
    id.includes(`_${RarityType.Uncommon}_`) ||
    id.includes(`_${RarityType.Rare}_`) ||
    id.includes(`_${RarityType.Epic}_`) ||
    id.includes(`_${RarityType.Legendary}_`)

  if (conditionalEndsWith) {
    switch (true) {
      case id.endsWith(`_${RarityType.Common}`):
        setRarity(RarityType.Common)
        break
      case id.endsWith(`_${RarityType.Uncommon}`):
        setRarity(RarityType.Uncommon)
        break
      case id.endsWith(`_${RarityType.Rare}`):
        setRarity(RarityType.Rare)
        break
      case id.endsWith(`_${RarityType.Epic}`):
        setRarity(RarityType.Epic)
        break
      case id.endsWith(`_${RarityType.Legendary}`):
        setRarity(RarityType.Legendary)
        break
    }
  } else if (conditionalIncludes) {
    switch (true) {
      case id.includes(`_${RarityType.Common}_`):
        setRarity(RarityType.Common)
        break
      case id.includes(`_${RarityType.Uncommon}_`):
        setRarity(RarityType.Uncommon)
        break
      case id.includes(`_${RarityType.Rare}_`):
        setRarity(RarityType.Rare)
        break
      case id.includes(`_${RarityType.Epic}_`):
        setRarity(RarityType.Epic)
        break
      case id.includes(`_${RarityType.Legendary}_`):
        setRarity(RarityType.Legendary)
        break
    }
  }

  return data
}
