import type { Settings } from '../../types/settings'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from './windows/main'
import { DataDirectory } from './data-directory'
import { SystemTray } from './system-tray'

export class SettingsManager {
  static async load() {
    const settings = await SettingsManager.getData()

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.OnLoadSettings,
      settings
    )

    await SettingsManager.update(settings)
  }

  static async getData() {
    const defaultSettingsData = DataDirectory.getSettingsDefaultData()
    const result = await DataDirectory.getSettingsFile()
    const settings: Required<Settings> = {
      path: result.settings.path ?? defaultSettingsData.path,
      systemTray:
        result.settings.systemTray ??
        (defaultSettingsData.systemTray as boolean),
      userAgent:
        result.settings.userAgent ??
        (defaultSettingsData.userAgent as string),
    }

    return settings
  }

  static async update(settings: Settings) {
    if (
      settings.systemTray !== undefined &&
      SystemTray.isActive !== settings.systemTray
    ) {
      SystemTray.setIsActive(settings.systemTray)

      if (SystemTray.isActive) {
        SystemTray.create({
          onOpen: async () => {
            MainWindow.instance.show()
          },
        })
      } else {
        SystemTray.destroy()
      }
    }

    await DataDirectory.updateSettingsFile(settings)
  }
}
