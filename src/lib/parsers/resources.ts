import type {
  ParseModifierData,
  ParseResourceData,
  RewardsSummary,
} from '../../types/data/resources'

import {
  modifiersAvailable,
  WorldModifier,
} from '../../config/constants/fortnite/world-info'
import {
  RarityType,
  ingredientsJson,
  rarities,
  resourcesJson,
  survivorsJson,
  survivorsMythicLeadsJson,
  trapsJson,
} from '../../config/constants/resources'

import { assets } from '../repository'

export function getKey<Data = unknown>(
  key: string,
  resource: Record<string, Data>,
) {
  return Object.entries(resource).find(([id]) => key.includes(id))
}

export function parseModifier(key: string) {
  const data: ParseModifierData = {
    id: key,
    imageUrl: assets('question'),
  }
  const newKey = `${key}`.replace('GameplayModifier:', '')

  if (modifiersAvailable.includes(newKey as WorldModifier)) {
    data.imageUrl = assets(newKey)
  }

  return data
}

export function parseResource({
  context,
  key,
  quantity,
}: {
  context?: 'world-info'
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
    imgUrl: assets(rarity.rarity),
    itemType: key,
    name: rarity.type,
    rarity: rarity.rarity,
    type: null,
  }

  const resource = getKey(newKey, resourcesJson)

  if (resource) {
    const resourceId = resource[0]
    // const isEventCurrency =
    //   (newKey !== 'eventcurrency_scaling' &&
    //     newKey !== 'eventcurrency_founders' &&
    //     newKey.startsWith('eventcurrency_')) ||
    //   newKey === 'campaign_event_currency'
    // const typeFn = isEventCurrency ? assets : imgResources
    // const isUnknownTickets = [
    //   'campaign_event_currency',
    //   'eventcurrency_spring',
    //   'eventcurrency_summer',
    // ]
    // const extension = isUnknownTickets.includes(resourceId) ? 'gif' : 'png'

    data.imgUrl = assets(resourceId)
    data.name = resource[1].name
    data.type = 'resource'

    return data
  }

  const ingredient = getKey(newKey, ingredientsJson)

  if (ingredient) {
    const [ingredientId, ingredientData] = ingredient

    data.imgUrl = assets(ingredientId)
    data.name = ingredientData.name
    data.type = 'ingredient'

    return data
  }

  const survivor = getKey(newKey, survivorsJson)
  const mythicSurvivor = getKey(newKey, survivorsMythicLeadsJson)
  const isWorker = newKey.startsWith('Worker:')

  if (survivor || mythicSurvivor || isWorker) {
    if (mythicSurvivor) {
      const [survivorId] = mythicSurvivor

      data.imgUrl = assets(survivorId)
      data.name = `${rarities[RarityType.Mythic]} Lead`
    } else if (survivor) {
      const [survivorId, survivorData] = survivor

      data.imgUrl = assets(survivorId)
      data.name = survivorData.name
        ? survivorData.name
        : `${rarities[rarity.rarity]} Survivor`
    } else {
      const convertRarity = {
        [RarityType.Common]: RarityType.Uncommon,
        [RarityType.Uncommon]: RarityType.Rare,
        [RarityType.Rare]: RarityType.Epic,
        [RarityType.Epic]: RarityType.Legendary,
      }
      const isLeader = newKey.includes('manager')
      const newRarity =
        isLeader && context === 'world-info'
          ? convertRarity[rarity.rarity as keyof typeof convertRarity]
          : rarity.rarity

      data.imgUrl = assets(
        `voucher_generic_${isLeader ? 'manager' : 'worker'}_${newRarity}`,
      )
      data.itemType = key.replace(`_${rarity.rarity}_`, `_${newRarity}_`)
      data.name = `${rarities[newRarity as RarityType]} ${
        isLeader ? 'Lead ' : ''
      }Survivor`
      data.rarity = newRarity
    }

    data.type = 'worker'

    return data
  }

  const isHero = newKey.startsWith('Hero:')

  if (isHero) {
    data.imgUrl = assets(`voucher_generic_hero_${rarity.rarity}`)
    data.name = `${rarities[rarity.rarity]} Hero`
    data.type = 'hero'

    return data
  }

  const isDefender = newKey.startsWith('Defender:')

  if (isDefender) {
    data.imgUrl = assets(`voucher_generic_defender_${rarity.rarity}`)
    data.name = `${rarities[rarity.rarity]} Defender`
    data.type = 'defender'

    return data
  }

  const trap = getKey(newKey, trapsJson)
  const isSchematic = newKey.startsWith('Schematic:')

  if (trap || isSchematic) {
    if (trap) {
      const [trapId, trapData] = trap

      data.imgUrl = assets(trapId)
      data.name = `${rarities[rarity.rarity]} ${trapData.name}`
      data.type = 'trap'
    } else {
      data.imgUrl = assets(`voucher_generic_schematic_${rarity.rarity}`)
      data.name = `${rarities[rarity.rarity]} Schematic`
    }

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
    id.endsWith(`_${RarityType.Legendary}`) ||
    id.endsWith(`_${RarityType.Mythic}`)
  const conditionalIncludes =
    id.includes(`_${RarityType.Common}_`) ||
    id.includes(`_${RarityType.Uncommon}_`) ||
    id.includes(`_${RarityType.Rare}_`) ||
    id.includes(`_${RarityType.Epic}_`) ||
    id.includes(`_${RarityType.Legendary}_`) ||
    id.includes(`_${RarityType.Mythic}_`)

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
      case id.endsWith(`_${RarityType.Mythic}`):
        setRarity(RarityType.Mythic)
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
      case id.includes(`_${RarityType.Mythic}_`):
        setRarity(RarityType.Mythic)
        break
    }
  }

  return data
}

export function sortRewardsSummary(rewards: RewardsSummary) {
  return Object.entries(rewards)
    .toSorted((itemA, itemB) => {
      const isMtxA = itemA[0].includes('currency_mtxswap') ? 1 : 0
      const isMtxB = itemB[0].includes('currency_mtxswap') ? 1 : 0

      const isUpgradeLlamaTokenA = itemA[0].includes(
        'voucher_cardpack_bronze',
      )
        ? 1
        : 0
      const isUpgradeLlamaTokenB = itemB[0].includes(
        'voucher_cardpack_bronze',
      )
        ? 1
        : 0

      const isEvoPDORA = itemA[0].includes('reagent_c_t01') ? 1 : 0
      const isEvoPDORB = itemB[0].includes('reagent_c_t01') ? 1 : 0
      const isEvoLIABA = itemA[0].includes('reagent_c_t02') ? 1 : 0
      const isEvoLIABB = itemB[0].includes('reagent_c_t02') ? 1 : 0
      const isEvoEOTSA = itemA[0].includes('reagent_c_t03') ? 1 : 0
      const isEvoEOTSB = itemB[0].includes('reagent_c_t03') ? 1 : 0
      const isEvoSSA = itemA[0].includes('reagent_c_t04') ? 1 : 0
      const isEvoSSB = itemB[0].includes('reagent_c_t04') ? 1 : 0

      const isLegendaryPerkUpA = itemA[0].includes(
        'reagent_alteration_upgrade_sr',
      )
        ? 1
        : 0
      const isLegendaryPerkUpB = itemB[0].includes(
        'reagent_alteration_upgrade_sr',
      )
        ? 1
        : 0
      const isEpicPerkUpA = itemA[0].includes(
        'reagent_alteration_upgrade_vr',
      )
        ? 1
        : 0
      const isEpicPerkUpB = itemB[0].includes(
        'reagent_alteration_upgrade_vr',
      )
        ? 1
        : 0
      const isRarePerkUpA = itemA[0].includes(
        'reagent_alteration_upgrade_r',
      )
        ? 1
        : 0
      const isRarePerkUpB = itemB[0].includes(
        'reagent_alteration_upgrade_r',
      )
        ? 1
        : 0
      const isUncommonPerkUpA = itemA[0].includes(
        'reagent_alteration_upgrade_uc',
      )
        ? 1
        : 0
      const isUncommonPerkUpB = itemB[0].includes(
        'reagent_alteration_upgrade_uc',
      )
        ? 1
        : 0

      const isElementFirePerkUpA = itemA[0].includes(
        'reagent_alteration_ele_fire',
      )
        ? 1
        : 0
      const isElementFirePerkUpB = itemB[0].includes(
        'reagent_alteration_ele_fire',
      )
        ? 1
        : 0
      const isElementNaturePerkUpA = itemA[0].includes(
        'reagent_alteration_ele_nature',
      )
        ? 1
        : 0
      const isElementNaturePerkUpB = itemB[0].includes(
        'reagent_alteration_ele_nature',
      )
        ? 1
        : 0
      const isElementWaterPerkUpA = itemA[0].includes(
        'reagent_alteration_ele_water',
      )
        ? 1
        : 0
      const isElementWaterPerkUpB = itemB[0].includes(
        'reagent_alteration_ele_water',
      )
        ? 1
        : 0
      const isGenericPerkUpA = itemA[0].includes(
        'reagent_alteration_generic',
      )
        ? 1
        : 0
      const isGenericPerkUpB = itemB[0].includes(
        'reagent_alteration_generic',
      )
        ? 1
        : 0

      const isHeroXPA = itemA[0].includes('heroxp') ? 1 : 0
      const isHeroXPB = itemB[0].includes('heroxp') ? 1 : 0
      const isSchematicXPA = itemA[0].includes('schematicxp') ? 1 : 0
      const isSchematicXPB = itemB[0].includes('schematicxp') ? 1 : 0
      const isSurvivorXPA = itemA[0].includes('personnelxp') ? 1 : 0
      const isSurvivorXPB = itemB[0].includes('personnelxp') ? 1 : 0
      const isVentureXPA = itemA[0].includes('phoenixxp') ? 1 : 0
      const isVentureXPB = itemB[0].includes('phoenixxp') ? 1 : 0

      return (
        isMtxB - isMtxA ||
        isUpgradeLlamaTokenB - isUpgradeLlamaTokenA ||
        isEvoPDORB - isEvoPDORA ||
        isEvoLIABB - isEvoLIABA ||
        isEvoEOTSB - isEvoEOTSA ||
        isEvoSSB - isEvoSSA ||
        isLegendaryPerkUpB - isLegendaryPerkUpA ||
        isEpicPerkUpB - isEpicPerkUpA ||
        isRarePerkUpB - isRarePerkUpA ||
        isUncommonPerkUpB - isUncommonPerkUpA ||
        isElementFirePerkUpB - isElementFirePerkUpA ||
        isElementNaturePerkUpB - isElementNaturePerkUpA ||
        isElementWaterPerkUpB - isElementWaterPerkUpA ||
        isGenericPerkUpB - isGenericPerkUpA ||
        isHeroXPB - isHeroXPA ||
        isSchematicXPB - isSchematicXPA ||
        isSurvivorXPB - isSurvivorXPA ||
        isVentureXPB - isVentureXPA
      )
    })
    .reduce(
      (accumulator, [key, reward]) => {
        accumulator[key] = reward

        return accumulator
      },
      {} as Record<
        string,
        {
          imageUrl: string
          quantity: number
        }
      >,
    )
}
