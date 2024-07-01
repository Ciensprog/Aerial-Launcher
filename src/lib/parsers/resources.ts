import { repositoryAssetsURL } from '../../config/about/links'
import {
  RarityType,
  rarities,
  resourcesJson,
} from '../../config/constants/resources'

export function parseResource({
  key,
  quantity,
}: {
  key: string
  quantity: number
}) {
  const data: {
    key: string
    imgUrl: string
    name: string
    quantity: number
  } = {
    key,
    quantity,
    imgUrl: `${repositoryAssetsURL}/images/rarities/c.png`,
    name: 'Uncategorized',
  }
  const current = resourcesJson[key]

  if (current) {
    const isEventCurrency =
      key !== 'AccountResource:eventcurrency_scaling' &&
      key.startsWith('AccountResource:eventcurrency_')
    const resourceId = key.split(':')[1]

    data.imgUrl = `${repositoryAssetsURL}/images/${resourceId ? `${isEventCurrency ? 'currency' : 'resources'}/${resourceId}` : `rarities/${RarityType.Common}`}.png`
    data.name = current.name
  } else {
    const rarity = parseRarity(key)

    data.imgUrl = `${repositoryAssetsURL}/images/rarities/${rarity.rarity}.png`
    data.name = rarity.prefix
  }

  return data
}

export function parseRarity(value: string) {
  const prefix = value.split(':')[0]
  const id = value.split(':')[1]
  const data = {
    prefix,
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
      case id.includes(`_${RarityType.Common}`):
        setRarity(RarityType.Common)
        break
      case id.includes(`_${RarityType.Uncommon}`):
        setRarity(RarityType.Uncommon)
        break
      case id.includes(`_${RarityType.Rare}`):
        setRarity(RarityType.Rare)
        break
      case id.includes(`_${RarityType.Epic}`):
        setRarity(RarityType.Epic)
        break
      case id.includes(`_${RarityType.Legendary}`):
        setRarity(RarityType.Legendary)
        break
    }
  }

  return data
}
