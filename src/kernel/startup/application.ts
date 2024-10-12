import packageJson from '../../../package.json'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from './windows/main'

import { getAppReleases } from '../../services/endpoints/repository'

export class Application {
  static async checkVersion() {
    try {
      const currentVersion = `v${packageJson.version}`

      const response = await getAppReleases()
      const latest = response.data[0]

      if (latest && latest.tag_name !== currentVersion) {
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.ResponseNewVersionStatus,
          {
            link: latest.html_url,
            version: latest.tag_name,
          }
        )

        return
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.ResponseNewVersionStatus,
      null
    )
  }
}
