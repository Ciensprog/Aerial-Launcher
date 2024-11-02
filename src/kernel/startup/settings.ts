import type {
  CustomizableMenuSettings,
  Settings,
} from '../../types/settings'

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
      claimingRewards:
        result.settings.claimingRewards ??
        defaultSettingsData.claimingRewards,
      missionInterval:
        result.settings.missionInterval ??
        defaultSettingsData.missionInterval,
      path: result.settings.path ?? defaultSettingsData.path,
      systemTray:
        result.settings.systemTray ?? defaultSettingsData.systemTray,
      userAgent:
        result.settings.userAgent ?? defaultSettingsData.userAgent,
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

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.OnLoadSettings,
      settings
    )
  }
}

export class DevSettingsManager {
  static async load() {
    const data = await DataDirectory.getDevSettingsFile()

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.DevSettingsResponse,
      data.devSettings
    )
  }
}

export class CustomizableMenuSettingsManager {
  static async load() {
    const customizableMenuSettings =
      await CustomizableMenuSettingsManager.getData()

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.CustomizableMenuSettingsResponse,
      customizableMenuSettings
    )
  }

  static async getData() {
    const { customizableMenu } =
      await DataDirectory.getCustomizableMenuSettingsFile()

    return customizableMenu
  }

  static async update(
    key: keyof CustomizableMenuSettings,
    visibility: boolean
  ) {
    const customizableMenuSettings =
      await CustomizableMenuSettingsManager.getData()
    const newData: CustomizableMenuSettings = {
      ...customizableMenuSettings,
      [key]: visibility,
    }

    await DataDirectory.updateCustomizableMenuSettingsFile(newData)

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.CustomizableMenuSettingsResponse,
      newData
    )
  }
}
