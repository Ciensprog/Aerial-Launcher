import type { AccountList } from '../../types/accounts'
import type { Settings } from '../../types/settings'
import type { TagRecord } from '../../types/tags'

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { accountListSchema } from '../../lib/validations/schemas/accounts'
import { settingsSchema } from '../../lib/validations/schemas/settings'
import { tagsSchema } from '../../lib/validations/schemas/tags'

export class DataDirectory {
  private static dataDirectoryPath = path.join(
    `${process.env.APPDATA}`,
    'aerial-launcher-data'
  )

  private static accountsFilePath = path.join(
    DataDirectory.dataDirectoryPath,
    'accounts.json'
  )
  private static accountsDefaultData: AccountList = []

  private static settingsFilePath = path.join(
    DataDirectory.dataDirectoryPath,
    'settings.json'
  )
  private static settingsDefaultData: Settings = {
    path: 'C:\\Program Files\\Epic Games\\Fortnite\\FortniteGame\\Binaries\\Win64',
  }

  private static tagsFilePath = path.join(
    DataDirectory.dataDirectoryPath,
    'tags.json'
  )
  private static tagsDefaultData: TagRecord = {}

  /**
   * Create data directory and accounts.json
   */
  static async createDataResources() {
    await DataDirectory.checkOrCreateDataDirectory()
    await DataDirectory.getOrCreateAccountsJsonFile()
    await DataDirectory.getOrCreateSettingsJsonFile()
    await DataDirectory.getOrCreateTagsJsonFile()
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
