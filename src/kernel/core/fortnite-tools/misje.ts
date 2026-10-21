import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

import { dialog } from 'electron'

import { DataDirectory } from '../../startup/data-directory'

import {
  loadMisjeConfig,
  saveMisjeConfig,
  type MisjeConfig,
} from '../../../lib/misje/config'
import { DEFAULT_SWAP_DISPLAY_NAME } from '../../../lib/misje/presets'
import { fetchProcessedWorldInfo, type ProcessOptions } from '../../../lib/misje/world-info-processor'

export class FortniteToolsMisje {
  static async getConfig() {
    return loadMisjeConfig(DataDirectory.getDataDirectoryPath())
  }

  static async saveConfig(config: Partial<MisjeConfig>) {
    saveMisjeConfig(DataDirectory.getDataDirectoryPath(), config)
  }

  static async fetchPreset(options: ProcessOptions) {
    const config = loadMisjeConfig(DataDirectory.getDataDirectoryPath())
    return fetchProcessedWorldInfo(
      options,
      config.displayNameValue || DEFAULT_SWAP_DISPLAY_NAME,
    )
  }

  static async saveToPath(targetPath: string, data: unknown) {
    await mkdir(path.dirname(targetPath), { recursive: true })
    await writeFile(targetPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
    return targetPath
  }

  static async readJsonFile(filePath: string) {
    const content = await readFile(filePath, 'utf8')
    return JSON.parse(content)
  }

  static async pickOutputDir() {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    })
    return result.canceled ? null : result.filePaths[0] ?? null
  }

  static async pickOutputFile() {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    return result.canceled ? null : result.filePaths[0] ?? null
  }

  static async pickSaveFile(defaultPath?: string) {
    const result = await dialog.showSaveDialog({
      defaultPath,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    return result.canceled ? null : result.filePath ?? null
  }
}