import type { XPBoostsDataWithAccountData } from '../../types/xpboosts'

export function calculateTeammateXPBoostsToUse({
  amountToSend,
  data,
}: {
  amountToSend: number
  data: Array<XPBoostsDataWithAccountData>
}) {
  const prevData = structuredClone(data)
  const newData: Record<string, number> = {}
  let counter = 0

  if (amountToSend <= 0) {
    return newData
  }

  for (let index = 0; index < amountToSend; index++) {
    if (counter >= amountToSend) {
      break
    }

    for (const indexPrevData in prevData) {
      if (counter >= amountToSend) {
        break
      }

      const current = prevData[indexPrevData]

      if (!current) {
        continue
      }

      const { accountId, available, items, account } = current

      if (!account || !available || items.teammate.quantity <= 0) {
        continue
      }

      if (!newData[accountId]) {
        newData[accountId] = 0
      }

      prevData[indexPrevData].items.teammate.quantity--
      newData[accountId]++
      counter++
    }
  }

  return newData
}
