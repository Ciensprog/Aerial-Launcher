import type { AccountData } from '../../types/accounts'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { Authentication } from './authentication'

import { DataDirectory } from '../startup/data-directory'

import { findPlayer } from '../../services/endpoints/matchmaking'

export class MatchmakingTrack {
  static async saveFile(
    currentWindow: BrowserWindow,
    account: AccountData,
    accountId: string
  ) {
    let status = false

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (accessToken) {
        const response = await findPlayer({
          accessToken,
          accountId,
        })
        const hasContent = (response.data?.length ?? 0) > 0
        const data = hasContent ? response.data : []

        await DataDirectory.updateMatchmakingFile(data)

        status = hasContent
      }
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.MatchmakingTrackSaveFileNotification,
      status
    )
  }
}
