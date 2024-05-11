import type { GroupRecord } from '../../types/groups'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { DataDirectory } from './data-directory'

export class GroupsManager {
  static async load(currentWindow: BrowserWindow) {
    const { groups } = await DataDirectory.getGroupsFile()

    currentWindow.webContents.send(
      ElectronAPIEventKeys.OnLoadGroups,
      groups
    )
  }

  static async update(groups: GroupRecord) {
    await DataDirectory.updateGroupsFile(groups)
  }
}
