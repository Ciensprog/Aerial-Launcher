import type {
  AutoLlamasData,
  AutoLlamasRecord,
} from '../../types/auto-llamas'

import { Collection } from '@discordjs/collection'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from './windows/main'
import { DataDirectory } from './data-directory'

import {
  AutoLlamasAccountAddParams,
  AutoLlamasAccountUpdateParams,
  AutoLlamasBulkAction,
} from '../../state/stw-operations/auto/llamas'

export class AutoLlamas {
  private static _accounts: Collection<string, AutoLlamasData> =
    new Collection()

  static async load() {
    const { autoLlamas } = await DataDirectory.getAutoLlamasFile()

    Object.values(autoLlamas).forEach(({ accountId, actions }) => {
      AutoLlamas._accounts.set(accountId, {
        accountId,
        actions,
      })
    })

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.AutoLlamasLoadAccountsResponse,
      autoLlamas
    )
  }

  static async addAccount(accounts: AutoLlamasAccountAddParams) {
    const result = await DataDirectory.getAutoLlamasFile()

    await DataDirectory.updateAutoLlamasFile({
      ...result.autoLlamas,
      ...Object.entries(accounts ?? {}).reduce(
        (accumulator, [accountId, value]) => {
          accumulator[accountId] = {
            accountId,
            actions: {
              survivors: value.actions?.survivors ?? false,
            },
          }

          AutoLlamas._accounts.set(accountId, accumulator[accountId])

          return accumulator
        },
        {} as AutoLlamasRecord
      ),
    })
  }

  static async removeAccounts(data: Array<string> | null) {
    if (data === null) {
      await DataDirectory.updateAutoLlamasFile({})

      return
    }

    const accounts = AutoLlamas._accounts.reduce(
      (accumulator, { accountId, actions }) => {
        if (data.includes(accountId)) {
          AutoLlamas._accounts.delete(accountId)
        } else {
          accumulator[accountId] = {
            accountId,
            actions,
          }
        }

        return accumulator
      },
      {} as AutoLlamasRecord
    )

    await DataDirectory.updateAutoLlamasFile(accounts)
  }

  static async updateAccounts(data: AutoLlamasAccountUpdateParams) {
    if (
      data === AutoLlamasBulkAction.EnableBuy ||
      data === AutoLlamasBulkAction.DisableBuy
    ) {
      const accounts = AutoLlamas._accounts.reduce(
        (accumulator, { accountId, actions }) => {
          const survivorsNewState =
            data === AutoLlamasBulkAction.EnableBuy
              ? true
              : data === AutoLlamasBulkAction.DisableBuy
                ? false
                : actions.survivors

          accumulator[accountId] = {
            accountId,
            actions: {
              ...actions,
              survivors: survivorsNewState,
            },
          }

          return accumulator
        },
        {} as AutoLlamasRecord
      )

      await DataDirectory.updateAutoLlamasFile(accounts)

      return
    }

    const accounts = AutoLlamas._accounts.reduce(
      (accumulator, { accountId, actions }) => {
        accumulator[accountId] = {
          accountId,
          actions,
        }

        const current = data[accountId] as
          | (typeof data)[string]
          | undefined

        if (current) {
          current
          accumulator[accountId].actions[current.config.type] =
            current.config.value === 'toggle'
              ? !accumulator[accountId].actions[current.config.type]
              : current.config.value
        }

        return accumulator
      },
      {} as AutoLlamasRecord
    )

    await DataDirectory.updateAutoLlamasFile(accounts)
  }

  static findById(accountId: string) {
    return AutoLlamas._accounts.find(
      (item) => item.accountId === accountId
    )
  }
}
