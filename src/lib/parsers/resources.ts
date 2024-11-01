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
    imgUrl: `${repositoryAssetsURL}/images/rarities/${RarityType.Common}.png`,
    name: 'Uncategorized',
  }
  const current = resourcesJson[key]
  const baseUrl = `${repositoryAssetsURL}/images/`

  if (current) {
    const resourceId = key.split(':')[1]

    if (resourceId) {
      const isEventCurrency =
        (key !== 'AccountResource:eventcurrency_scaling' &&
          key !== 'AccountResource:eventcurrency_founders' &&
          key.startsWith('AccountResource:eventcurrency_')) ||
        key === 'AccountResource:campaign_event_currency'
      const type = isEventCurrency ? 'currency' : 'resources'
      const isUnknownTickets = [
        'campaign_event_currency',
        'eventcurrency_spring',
        'eventcurrency_summer',
      ]
      const extension = isUnknownTickets.includes(resourceId)
        ? 'gif'
        : 'png'

      data.imgUrl = `${baseUrl}/${type}/${resourceId}.${extension}`
    } else {
      data.imgUrl = `${baseUrl}/rarities/${RarityType.Common}}.png`
    }

    data.name = current.name
  } else {
    const rarity = parseRarity(key)

    data.imgUrl = `${baseUrl}/rarities/${rarity.rarity}.png`
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
