import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { SettingsManager } from '../startup/settings'

export class Manifest {
  static getData() {
    try {
      const manifestsDirectory =
        'C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests'

      const getFile = (filename: string) => {
        const filePath = path.join(manifestsDirectory, filename)
        const file = JSON.parse(readFileSync(filePath).toString()) as {
          AppVersionString: string
          LaunchCommand: string
          DisplayName: string
        }
        const appVersionString = file.AppVersionString?.trim()

        return {
          AppVersionString: appVersionString ?? '',
          DisplayName: file.DisplayName?.trim().toLowerCase() ?? '',
          LaunchCommand: file.LaunchCommand?.trim() ?? '',
          UserAgent: appVersionString
            ? `Fortnite/${appVersionString}`
            : '',
        }
      }

      const responseItem = readdirSync(manifestsDirectory).find(
        (filename) => {
          if (filename.endsWith('item')) {
            return getFile(filename).DisplayName === 'fortnite'
          }

          return false
        }
      )

      if (responseItem) {
        const manifestItem = getFile(responseItem)

        return manifestItem
      }
    } catch (error) {
      //
    }

    return null
  }

  static async getUserAgent() {
    const userAgent = Manifest.getData()?.UserAgent
    const settings = await SettingsManager.getData()

    return userAgent ?? settings.userAgent
  }
}
