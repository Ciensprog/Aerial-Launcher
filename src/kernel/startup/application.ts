import { BrowserWindow } from 'electron'

import packageJson from '../../../package.json'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { getAppReleases } from '../../services/endpoints/repository'

export class Application {
  static async checkVersion(currentWindow: BrowserWindow) {
    try {
      const currentVersion = `v${packageJson.version}`

      const response = await getAppReleases()
      const latest = response.data[0]

      if (latest && latest.tag_name !== currentVersion) {
        currentWindow.webContents.send(
          ElectronAPIEventKeys.ResponseNewVersionStatus,
          {
            link: latest.html_url,
            version: latest.tag_name,
          }
        )

        return
      }
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.ResponseNewVersionStatus,
      null
    )
  }
}
