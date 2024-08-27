import type { GroupRecord } from '../../types/groups'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from './windows/main'
import { DataDirectory } from './data-directory'

export class GroupsManager {
  static async load() {
    const { groups } = await DataDirectory.getGroupsFile()

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.OnLoadGroups,
      groups
    )
  }

  static async update(groups: GroupRecord) {
    await DataDirectory.updateGroupsFile(groups)
  }
}
