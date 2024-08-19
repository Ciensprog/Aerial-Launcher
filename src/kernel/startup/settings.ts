import type { Settings } from '../../types/settings'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { DataDirectory } from './data-directory'

export class SettingsManager {
  static async load(currentWindow: BrowserWindow) {
    const settings = await SettingsManager.getData()

    currentWindow.webContents.send(
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
      userAgent:
        result.settings.userAgent ??
        (defaultSettingsData.userAgent as string),
    }

    return settings
  }

  static async update(settings: Settings) {
    await DataDirectory.updateSettingsFile(settings)
  }
}
