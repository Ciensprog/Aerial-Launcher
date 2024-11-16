export function isEvoMat(key: string) {
  return (
    key.includes('reagent_c_t01') ||
    key.includes('reagent_c_t02') ||
    key.includes('reagent_c_t03') ||
    key.includes('reagent_c_t04')
  )
}

export function isLegendaryOrMythicSurvivor(itemId: string) {
  return (
    itemId.includes('workerbasic_sr') ||
    (itemId.startsWith('Worker:manager') && itemId.includes('_sr_'))
  )
}
