import type { TagRecord } from '../../types/tags'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { DataDirectory } from './data-directory'

import { sortTags } from '../../lib/utils'

export class TagsManager {
  static async load(currentWindow: BrowserWindow) {
    const result = await DataDirectory.getTagsFile()
    const tags: TagRecord = sortTags(result.tags)

    currentWindow.webContents.send(ElectronAPIEventKeys.OnLoadTags, tags)
  }

  static async update(currentWindow: BrowserWindow, tags: TagRecord) {
    await DataDirectory.updateTagsFile(sortTags(tags))

    currentWindow.webContents.send(
      ElectronAPIEventKeys.NotificationCreationTag
    )
  }
}
