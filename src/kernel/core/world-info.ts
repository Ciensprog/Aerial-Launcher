import type { WorldInfoResponse } from '../../types/data/advanced-mode/world-info'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'
import { defaultFortniteClient } from '../../config/fortnite/clients'

import { getWorldInfoData } from '../../services/endpoints/advanced-mode/world-info'
import { createAccessTokenUsingClientCredentials } from '../../services/endpoints/oauth'

export class WorldInfoManager {
  static async requestData(currentWindow: BrowserWindow) {
    const defaultResponse = () => {
      currentWindow.webContents.send(
        ElectronAPIEventKeys.WorldInfoResponseFile,
        {
          data: null,
          status: false,
        } as WorldInfoResponse
      )
    }

    try {
      const accessToken = await createAccessTokenUsingClientCredentials({
        authorization: defaultFortniteClient.use.auth,
      })

      if (!accessToken.data.access_token) {
        defaultResponse()

        return
      }

      const worldInfoResponse = await getWorldInfoData({
        accessToken: accessToken.data.access_token,
      })

      if (
        worldInfoResponse.data.missionAlerts?.length <= 0 ||
        worldInfoResponse.data.missions?.length <= 0 ||
        worldInfoResponse.data.theaters?.length <= 0
      ) {
        defaultResponse()

        return
      }

      currentWindow.webContents.send(
        ElectronAPIEventKeys.WorldInfoResponseFile,
        {
          data: worldInfoResponse.data,
          status: true,
        } as WorldInfoResponse
      )

      return
    } catch (error) {
      //
    }

    defaultResponse()
  }
}
