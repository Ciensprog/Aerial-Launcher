import type { AccountData } from '../../types/accounts'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
import { DataDirectory } from '../startup/data-directory'
import { Authentication } from './authentication'

import { findPlayer } from '../../services/endpoints/matchmaking'

export class MatchmakingTrack {
  static async saveFile(account: AccountData, accountId: string) {
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

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.MatchmakingTrackSaveFileNotification,
      status
    )
  }
}
