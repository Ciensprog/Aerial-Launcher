import { ipcRenderer } from 'electron'

import { FortniteToolsIpcKeys } from '../../config/constants/fortnite-tools'

export function misjeGetConfig() {
  return ipcRenderer.invoke(FortniteToolsIpcKeys.MisjeGetConfig)
}

export function misjeSaveConfig(config: unknown) {
  return ipcRenderer.invoke(FortniteToolsIpcKeys.MisjeSaveConfig, config)
}

export function misjeFetchPreset(options: unknown) {
  return ipcRenderer.invoke(FortniteToolsIpcKeys.MisjeFetchPreset, options)
}

export function misjeSaveFile(targetPath: string, data: unknown) {
  return ipcRenderer.invoke(FortniteToolsIpcKeys.MisjeSaveFile, targetPath, data)
}

export function misjePickDir() {
  return ipcRenderer.invoke(FortniteToolsIpcKeys.MisjePickDir)
}

export function misjePickFile() {
  return ipcRenderer.invoke(FortniteToolsIpcKeys.MisjePickFile)
}

export function misjePickSaveFile(defaultPath?: string) {
  return ipcRenderer.invoke(FortniteToolsIpcKeys.MisjePickSaveFile, defaultPath)
}

export function misjeReadFile(filePath: string) {
  return ipcRenderer.invoke(FortniteToolsIpcKeys.MisjeReadFile, filePath)
}