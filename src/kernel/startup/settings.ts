import type { Settings } from '../../types/settings'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { DataDirectory } from './data-directory'

export class SettingsManager {
  static async load(currentWindow: BrowserWindow) {
    const result = await DataDirectory.getSettingsFile()
    const settings: Settings = result.settings

    currentWindow.webContents.send(
      ElectronAPIEventKeys.OnLoadSettings,
      settings
    )
  }

  static async update(settings: Settings) {
    await DataDirectory.updateSettingsFile(settings)
  }
}
