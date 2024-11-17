import { repositoryAssetsURL } from '../config/about/links'

export function assets(path: string) {
  return `${repositoryAssetsURL}/${path}`
}

export function imgCurrency(filePath: string) {
  return assets(`images/currency/${filePath}`)
}

export function imgDifficulties(filePath: string) {
  return assets(`images/difficulties/${filePath}`)
}

export function imgIngredients(filePath: string) {
  return assets(`images/ingredients/${filePath}`)
}

export function imgLogos(filePath: string) {
  return assets(`images/logos/${filePath}`)
}

export function imgModifiers(filePath: string) {
  return assets(`images/modifiers/${filePath}`)
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

export function imgSurvivors(filePath: string) {
  return assets(`images/survivors/${filePath}`)
}

export function imgSurvivorsMythicLeads(filePath: string) {
  return imgSurvivors(`unique-leads/${filePath}`)
}

export function imgTraps(filePath: string) {
  return assets(`images/traps/${filePath}`)
}

export function imgWorld(filePath: string) {
  return assets(`images/world/${filePath}`)
}
