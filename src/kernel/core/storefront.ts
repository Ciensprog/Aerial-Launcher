import { AccountsManager } from '../startup/accounts'
import { AutoLlamas } from '../startup/auto-llamas'
import { Authentication } from './authentication'

import { getCatalog } from '../../services/endpoints/storefront'

export class Storefront {
  static async checkUpgradeFreeLlama() {
    const current = AutoLlamas.getAccounts().random()

    if (!current) {
      return false
    }

    try {
      const account = AccountsManager.getAccountById(current.accountId)

      if (!account) {
        return false
      }

      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        return false
      }

      const catalog = await getCatalog({ accessToken })
      const cardPacks = catalog.data.storefronts.find(
        (item) => item.name === 'CardPackStorePreroll'
      )

      if (!cardPacks) {
        return false
      }

      const freeLlamas = cardPacks.catalogEntries.find(
        (item) =>
          item.devName.toLowerCase().includes('free') &&
          item.title.toLowerCase().includes('free') &&
          item.prices[0]?.regularPrice === 50 &&
          item.prices[0]?.finalPrice === 0
      )

      return freeLlamas !== undefined

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    return false
  }
}
