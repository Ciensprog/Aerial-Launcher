import type { AccountData } from '../../types/accounts'
import type { RedeemCodeAccountNotification } from '../../types/redeem-codes'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
import { Authentication } from './authentication'

import { RedeemCodesStatus } from '../../state/management/redeem-code'

import { redeemCodeAccount } from '../../services/endpoints/fulfillment'

export class RedeemCodes {
  static async redeem(accounts: Array<AccountData>, codes: Array<string>) {
    accounts.forEach((account) => {
      codes.forEach((code) => {
        Authentication.verifyAccessToken(account)
          .then((accessToken) => {
            if (!accessToken) {
              return
            }

            redeemCodeAccount({
              accessToken,
              code,
              accountId: account.accountId,
            })
              .then(() => {
                MainWindow.instance.webContents.send(
                  ElectronAPIEventKeys.RedeemCodesRedeenNotification,
                  {
                    accountId: account.accountId,
                    code,
                    status: RedeemCodesStatus.SUCCESS,
                  } as RedeemCodeAccountNotification
                )
              })
              .catch((error) => {
                const errors: Record<string, RedeemCodesStatus> = {
                  'errors.com.epicgames.coderedemption.code_not_found':
                    RedeemCodesStatus.NOT_FOUND,
                  'errors.com.epicgames.coderedemption.codeUse_already_used':
                    RedeemCodesStatus.OWNED,
                  'errors.com.epicgames.coderedemption.multiple_redemptions_not_allowed':
                    RedeemCodesStatus.OWNED,
                  'errors.com.epicgames.coderedemption.code_used':
                    RedeemCodesStatus.USED,
                }

                const notification: RedeemCodeAccountNotification = {
                  accountId: account.accountId,
                  code,
                  status:
                    errors[error.response?.data?.errorCode] ??
                    RedeemCodesStatus.ERROR,
                }

                MainWindow.instance.webContents.send(
                  ElectronAPIEventKeys.RedeemCodesRedeenNotification,
                  notification
                )
              })
          })
          .catch(() => {
            MainWindow.instance.webContents.send(
              ElectronAPIEventKeys.RedeemCodesRedeenNotification,
              {
                accountId: account.accountId,
                code,
                status: RedeemCodesStatus.ERROR,
              } as RedeemCodeAccountNotification
            )
          })
      })
    })
  }
}
