import type { AccountList } from '../../types/accounts'
import type { AutomationAccountFileDataList } from '../../types/automation'
import type { FriendRecord } from '../../types/friends'
import type { GroupRecord } from '../../types/groups'
import type { Settings } from '../../types/settings'
import type { TagRecord } from '../../types/tags'

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { accountListSchema } from '../../lib/validations/schemas/accounts'
import { automationFileSchema } from '../../lib/validations/schemas/automation'
import { friendsSchema } from '../../lib/validations/schemas/friends'
import { groupsSchema } from '../../lib/validations/schemas/groups'
import { matchmakingsSchema } from '../../lib/validations/schemas/matchmaking'
import { settingsSchema } from '../../lib/validations/schemas/settings'
import { tagsSchema } from '../../lib/validations/schemas/tags'

export class DataDirectory {
  private static devPrefix = 'dev-'

  /**
   * Folders
   */

  private static dataDirectoryPath = path.join(
    `${process.env.APPDATA}`,
    'aerial-launcher-data'
  )

  private static worldInfoDirectoryPath = path.join(
    DataDirectory.dataDirectoryPath,
    'world-info'
  )

  /**
   * Files
   */

  private static accountsFilePath = MAIN_WINDOW_VITE_DEV_SERVER_URL
    ? path.join(
        DataDirectory.dataDirectoryPath,
        `${DataDirectory.devPrefix}accounts.json`
      )
    : path.join(DataDirectory.dataDirectoryPath, 'accounts.json')
  private static accountsDefaultData: AccountList = []

  private static settingsFilePath = path.join(
    DataDirectory.dataDirectoryPath,
    'settings.json'
  )
  private static settingsDefaultData: Settings = {
    path: 'C:\\Program Files\\Epic Games\\Fortnite\\FortniteGame\\Binaries\\Win64',
    userAgent: 'Fortnite/++Fortnite+Release-31.00-CL-35447195-Windows',
  }

  private static tagsFilePath = path.join(
    DataDirectory.dataDirectoryPath,
    'tags.json'
  )
  private static tagsDefaultData: TagRecord = {}

  private static groupsFilePath = path.join(
    DataDirectory.dataDirectoryPath,
    'groups.json'
  )
  private static groupsDefaultData: GroupRecord = {}

  private static friendsFilePath = path.join(
    DataDirectory.dataDirectoryPath,
    'friends.json'
  )
  private static friendsDefaultData: FriendRecord = {}

  static matchmakingFilePath = path.join(
    DataDirectory.dataDirectoryPath,
    'matchmaking.json'
  )
  private static matchmakingDefaultData: Array<unknown> = []

  static automationFilePath = path.join(
    DataDirectory.dataDirectoryPath,
    'automation.json'
  )
  private static automationDefaultData: AutomationAccountFileDataList = {}

  /**
   * Get default values
   */

  static getSettingsDefaultData() {
    return DataDirectory.settingsDefaultData
  }

  /**
   * Get Path
   */

  static getDataDirectoryPath() {
    return DataDirectory.dataDirectoryPath
  }

  static getWorldInfoDirectoryPath() {
    return DataDirectory.worldInfoDirectoryPath
  }

  /**
   * Create data directory and accounts.json
   */
  static async createDataResources() {
    await DataDirectory.checkOrCreateDataDirectory()
    await DataDirectory.checkOrCreateWorldInfoDirectory()
    await DataDirectory.getOrCreateAccountsJsonFile()
    await DataDirectory.getOrCreateSettingsJsonFile()
    await DataDirectory.getOrCreateTagsJsonFile()
    await DataDirectory.getOrCreateGroupsJsonFile()
    await DataDirectory.getOrCreateFriendsJsonFile()
    await DataDirectory.getOrCreateMatchmakingJsonFile()
    await DataDirectory.getOrCreateAutomationJsonFile()
  }

  /**
   * Get data from accounts.json
   */
  static async getAccountsFile(): Promise<{ accounts: AccountList }> {
    const result = await DataDirectory.getOrCreateAccountsJsonFile()

    try {
      const list = accountListSchema.safeParse(JSON.parse(result))
      const accounts = list.success ? list.data : []

      return { accounts }
    } catch (error) {
      //
    }

    return { accounts: [] }
  }

  /**
   * Get data from settings.json
   */
  static async getSettingsFile(): Promise<{ settings: Settings }> {
    const result = await DataDirectory.getOrCreateSettingsJsonFile()

    try {
      const list = settingsSchema.safeParse(JSON.parse(result))
      const settings = list.success
        ? list.data
        : DataDirectory.settingsDefaultData

      return { settings }
    } catch (error) {
      //
    }

    return { settings: DataDirectory.settingsDefaultData }
  }

  /**
   * Get data from tags.json
   */
  static async getTagsFile(): Promise<{ tags: TagRecord }> {
    const result = await DataDirectory.getOrCreateTagsJsonFile()

    try {
      const list = tagsSchema.safeParse(JSON.parse(result))
      const tags = list.success ? list.data : DataDirectory.tagsDefaultData

      return { tags }
    } catch (error) {
      //
    }

    return { tags: DataDirectory.tagsDefaultData }
  }

  /**
   * Get data from groups.json
   */
  static async getGroupsFile(): Promise<{ groups: GroupRecord }> {
    const result = await DataDirectory.getOrCreateGroupsJsonFile()

    try {
      const list = groupsSchema.safeParse(JSON.parse(result))
      const groups = list.success
        ? list.data
        : DataDirectory.groupsDefaultData

      return { groups }
    } catch (error) {
      //
    }

    return { groups: DataDirectory.groupsDefaultData }
  }

  /**
   * Get data from friends.json
   */
  static async getFriendsFile(): Promise<{ friends: FriendRecord }> {
    const result = await DataDirectory.getOrCreateFriendsJsonFile()

    try {
      const list = friendsSchema.safeParse(JSON.parse(result))
      const friends = list.success
        ? list.data
        : DataDirectory.friendsDefaultData

      return { friends }
    } catch (error) {
      //
    }

    return { friends: DataDirectory.friendsDefaultData }
  }

  /**
   * Get data from matchmaking.json
   */
  static async getMatchmakingFile(): Promise<{
    matchmaking: Array<unknown>
  }> {
    const result = await DataDirectory.getOrCreateMatchmakingJsonFile()

    try {
      const list = matchmakingsSchema.safeParse(JSON.parse(result))
      const matchmaking = list.success
        ? list.data
        : DataDirectory.matchmakingDefaultData

      return { matchmaking }
    } catch (error) {
      //
    }

    return { matchmaking: DataDirectory.matchmakingDefaultData }
  }

  /**
   * Get data from automation.json
   */
  static async getAutomationFile(): Promise<{
    automation: AutomationAccountFileDataList
  }> {
    const result = await DataDirectory.getOrCreateAutomationJsonFile()

    try {
      const list = automationFileSchema.safeParse(JSON.parse(result))
      const automation = list.success
        ? list.data
        : DataDirectory.automationDefaultData

      return { automation }
    } catch (error) {
      //
    }

    return { automation: DataDirectory.automationDefaultData }
  }

  /**
   * Update accounts.json
   */
  static async updateAccountsFile(data: AccountList) {
    await DataDirectory.updateJsonFile(
      DataDirectory.accountsFilePath,
      data
    )
  }

  /**
   * Update settings.json
   */
  static async updateSettingsFile(data: Settings) {
    await DataDirectory.updateJsonFile(
      DataDirectory.settingsFilePath,
      data
    )
  }

  /**
   * Update tags.json
   */
  static async updateTagsFile(data: TagRecord) {
    await DataDirectory.updateJsonFile(DataDirectory.tagsFilePath, data)
  }

  /**
   * Update tags.json
   */
  static async updateGroupsFile(data: GroupRecord) {
    await DataDirectory.updateJsonFile(DataDirectory.groupsFilePath, data)
  }

  /**
   * Update friends.json
   */
  static async updateFriendsFile(data: FriendRecord) {
    await DataDirectory.updateJsonFile(DataDirectory.friendsFilePath, data)
  }

  /**
   * Update matchmaking.json
   */
  static async updateMatchmakingFile(data: Array<unknown>) {
    await DataDirectory.updateJsonFile(
      DataDirectory.matchmakingFilePath,
      data
    )
  }

  /**
   * Update automation.json
   */
  static async updateAutomationFile(data: AutomationAccountFileDataList) {
    await DataDirectory.updateJsonFile(
      DataDirectory.automationFilePath,
      data
    )
  }

  /**
   * Creating World Info directory
   */
  static async checkOrCreateWorldInfoDirectory() {
    const checkDirectory = () =>
      readdir(DataDirectory.worldInfoDirectoryPath)

    try {
      await checkDirectory()
    } catch (error) {
      await mkdir(DataDirectory.worldInfoDirectoryPath)
    }

    return DataDirectory.worldInfoDirectoryPath
  }

  /**
   * Creating data directory
   */
  private static async checkOrCreateDataDirectory() {
    const checkDirectory = () => readdir(DataDirectory.dataDirectoryPath)

    try {
      await checkDirectory()
    } catch (error) {
      await mkdir(DataDirectory.dataDirectoryPath)
    }

    return DataDirectory.dataDirectoryPath
  }

  /**
   * Creating accounts.json
   */
  private static async getOrCreateAccountsJsonFile() {
    const initialData = DataDirectory.accountsDefaultData

    return await DataDirectory.getOrCreateJsonFile(
      DataDirectory.accountsFilePath,
      {
        defaults: {
          rawString: JSON.stringify(initialData),
          value: initialData,
        },
      }
    )
  }

  /**
   * Creating settings.json
   */
  private static async getOrCreateSettingsJsonFile() {
    const initialData = DataDirectory.settingsDefaultData

    return await DataDirectory.getOrCreateJsonFile(
      DataDirectory.settingsFilePath,
      {
        defaults: {
          rawString: JSON.stringify(initialData),
          value: initialData,
        },
      }
    )
  }

  /**
   * Creating tags.json
   */
  private static async getOrCreateTagsJsonFile() {
    const initialData = DataDirectory.tagsDefaultData

    return await DataDirectory.getOrCreateJsonFile(
      DataDirectory.tagsFilePath,
      {
        defaults: {
          rawString: JSON.stringify(initialData),
          value: initialData,
        },
      }
    )
  }

  /**
   * Creating groups.json
   */
  private static async getOrCreateGroupsJsonFile() {
    const initialData = DataDirectory.groupsDefaultData

    return await DataDirectory.getOrCreateJsonFile(
      DataDirectory.groupsFilePath,
      {
        defaults: {
          rawString: JSON.stringify(initialData),
          value: initialData,
        },
      }
    )
  }

  /**
   * Creating friends.json
   */
  private static async getOrCreateFriendsJsonFile() {
    const initialData = DataDirectory.friendsDefaultData

    return await DataDirectory.getOrCreateJsonFile(
      DataDirectory.friendsFilePath,
      {
        defaults: {
          rawString: JSON.stringify(initialData),
          value: initialData,
        },
      }
    )
  }

  /**
   * Creating matchmaking.json
   */
  private static async getOrCreateMatchmakingJsonFile() {
    const initialData = DataDirectory.matchmakingDefaultData

    return await DataDirectory.getOrCreateJsonFile(
      DataDirectory.matchmakingFilePath,
      {
        defaults: {
          rawString: JSON.stringify(initialData),
          value: initialData,
        },
      }
    )
  }

  /**
   * Creating automation.json
   */
  private static async getOrCreateAutomationJsonFile() {
    const initialData = DataDirectory.automationDefaultData

    return await DataDirectory.getOrCreateJsonFile(
      DataDirectory.automationFilePath,
      {
        defaults: {
          rawString: JSON.stringify(initialData),
          value: initialData,
        },
      }
    )
  }

  /**
   * Creating json file
   */
  private static async getOrCreateJsonFile(
    currentPath: string,
    config: {
      defaults: {
        rawString: string
        value: unknown
      }
    }
  ) {
    const checkFile = () =>
      readFile(currentPath, {
        encoding: 'utf8',
      })
    let result: string | undefined

    try {
      result = await checkFile()
    } catch (error) {
      await writeFile(
        currentPath,
        JSON.stringify(config.defaults.value, null, 2),
        {
          encoding: 'utf8',
        }
      )
      result = await checkFile()
    }

    return result ?? config.defaults.rawString
  }

  /**
   * Update json file
   */
  private static async updateJsonFile<Data>(
    currentPath: string,
    data: Data
  ) {
    if (!data) {
      return
    }

    try {
      await writeFile(currentPath, JSON.stringify(data ?? [], null, 2), {
        encoding: 'utf8',
      })
    } catch (error) {
      //
    }
  }
}
