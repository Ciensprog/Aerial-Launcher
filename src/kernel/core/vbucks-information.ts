import type { AccountData } from '../../types/accounts'
// import type {  } from '../../types/vbucks-information'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
// import { Authentication } from './authentication'

import { VBucksInformationState } from '../../state/management/vbucks-information'

// import {  } from '../../services/endpoints/mcp'

export class VBucksInformation {
  static async requestBulkInfo(accounts: Array<AccountData>) {
    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.VBucksInformationResponseData,
      {} as VBucksInformationState['data']
    )
  }

  static async getInfo(account: AccountData) {
    //
  }
}
