import type { TagRecord } from '../../types/tags'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from './windows/main'
import { DataDirectory } from './data-directory'

import { sortTags } from '../../lib/utils'

export class TagsManager {
  static async load() {
    const result = await DataDirectory.getTagsFile()
    const tags: TagRecord = sortTags(result.tags)

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.OnLoadTags,
      tags
    )
  }

  static async update(tags: TagRecord) {
    await DataDirectory.updateTagsFile(sortTags(tags))

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.NotificationCreationTag
    )
  }
}
