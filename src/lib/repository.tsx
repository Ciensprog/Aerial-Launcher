import { repositoryAssetsURL } from '../config/about/links'

export function assets(path: string) {
  return `${repositoryAssetsURL}/${path}`
}

export function imgCurrency(filePath: string) {
  return assets(`images/currency/${filePath}`)
}

export function imgLogos(filePath: string) {
  return assets(`images/logos/${filePath}`)
}

export function imgRandom(filePath: string) {
  return assets(`images/random/${filePath}`)
}

export function imgRarities(filePath: string) {
  return assets(`images/rarities/${filePath}`)
}

export function imgResources(filePath: string) {
  return assets(`images/resources/${filePath}`)
}
