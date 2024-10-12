import type { MCPQueryProfileMainProfile } from '../../types/services/mcp'
import type { AccountData } from '../../types/accounts'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
import { Authentication } from './authentication'

import {
  VBucksInformationCurrency,
  VBucksInformationState,
} from '../../state/management/vbucks-information'

import { getQueryProfileMainProfile } from '../../services/endpoints/mcp'

export class VBucksInformation {
  static async requestBulkInfo(accounts: Array<AccountData>) {
    accounts.forEach((account) => {
      VBucksInformation.getInfo(account)
        .then((data) => {
          if (data) {
            const items = Object.entries(
              data.profileChanges[0]?.profile.items ?? {}
            )
            const accountCurrency: VBucksInformationState['data'] = {
              [account.accountId]: {
                accountId: account.accountId,
                currency: {},
              },
            }

            items.forEach(([itemId, item]) => {
              if (item.templateId.startsWith('Currency:')) {
                accountCurrency[account.accountId].currency[itemId] = {
                  platform: item.attributes.platform ?? 'Unknown',
                  quantity: item.quantity ?? 0,
                  template: item.templateId.replace('Currency:Mtx', ''),
                }
              }
            })

            accountCurrency[account.accountId].currency = Object.entries(
              accountCurrency[account.accountId].currency
            )
              .toSorted(
                ([, itemA], [, itemB]) => itemB.quantity - itemA.quantity
              )
              .reduce(
                (accumulator, [templateId, current]) => {
                  accumulator[templateId] = current

                  return accumulator
                },
                {} as Record<string, VBucksInformationCurrency>
              )

            MainWindow.instance.webContents.send(
              ElectronAPIEventKeys.VBucksInformationResponseData,
              accountCurrency
            )
          }
        })
        .catch(() => {
          MainWindow.instance.webContents.send(
            ElectronAPIEventKeys.VBucksInformationResponseData,
            {} as VBucksInformationState['data']
          )
        })
    })
  }

  static async getInfo(account: AccountData) {
    let result: MCPQueryProfileMainProfile | null = null

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        return null
      }

      const response = await getQueryProfileMainProfile({
        accessToken,
        accountId: account.accountId,
      })

      result = response.data

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    return result
  }
}
