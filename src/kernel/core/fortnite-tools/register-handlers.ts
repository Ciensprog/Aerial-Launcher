import type { IpcMain } from 'electron'

import { FortniteToolsIpcKeys } from '../../../config/constants/fortnite-tools'
import type { ProcessOptions } from '../../../lib/misje/presets'

import { FortniteToolsMisje } from './misje'

export function registerFortniteToolsHandlers(ipcMain: IpcMain) {
  ipcMain.handle(FortniteToolsIpcKeys.MisjeGetConfig, () => FortniteToolsMisje.getConfig())
  ipcMain.handle(FortniteToolsIpcKeys.MisjeSaveConfig, (_, config) =>
    FortniteToolsMisje.saveConfig(config),
  )
  ipcMain.handle(FortniteToolsIpcKeys.MisjeFetchPreset, (_, options: ProcessOptions) =>
    FortniteToolsMisje.fetchPreset(options),
  )
  ipcMain.handle(FortniteToolsIpcKeys.MisjeSaveFile, (_, targetPath: string, data: unknown) =>
    FortniteToolsMisje.saveToPath(targetPath, data),
  )
  ipcMain.handle(FortniteToolsIpcKeys.MisjePickDir, () => FortniteToolsMisje.pickOutputDir())
  ipcMain.handle(FortniteToolsIpcKeys.MisjePickFile, () => FortniteToolsMisje.pickOutputFile())
  ipcMain.handle(FortniteToolsIpcKeys.MisjePickSaveFile, (_, defaultPath?: string) =>
    FortniteToolsMisje.pickSaveFile(defaultPath),
  )
  ipcMain.handle(FortniteToolsIpcKeys.MisjeReadFile, (_, filePath: string) =>
    FortniteToolsMisje.readJsonFile(filePath),
  )
}