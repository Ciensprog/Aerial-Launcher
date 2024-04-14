import type { AccountList } from '../../types/accounts'

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { accountListSchema } from '../../lib/validations/schemas/accounts'

export class DataDirectory {
  private static dataDirectoryPath = path.join(
    `${process.env.APPDATA}`,
    'aerial-launcher-data'
  )
  private static accountsFilePath = path.join(
    DataDirectory.dataDirectoryPath,
    'accounts.json'
  )

  /**
   * Create data directory and accounts.json
   */
  static async createDataFiles() {
    await DataDirectory.checkOrCreateDataDirectory()
    await DataDirectory.getOrCreateJsonFile()
  }

  /**
   * Get data from accounts.json
   */
  static async getAccountsFile(): Promise<{ accounts: AccountList }> {
    const result = await DataDirectory.getOrCreateJsonFile()

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
   * Update accounts.json
   */
  static async updateAccountsFile(data: AccountList) {
    if (!data) {
      return
    }

    try {
      await writeFile(
        DataDirectory.accountsFilePath,
        JSON.stringify(data ?? [], null, 2),
        {
          encoding: 'utf8',
        }
      )
    } catch (error) {
      //
    }
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
  private static async getOrCreateJsonFile() {
    const checkAccountsFile = () =>
      readFile(DataDirectory.accountsFilePath, {
        encoding: 'utf8',
      })
    let result: string | undefined

    try {
      result = await checkAccountsFile()
    } catch (error) {
      await writeFile(
        DataDirectory.accountsFilePath,
        JSON.stringify([], null, 2),
        {
          encoding: 'utf8',
        }
      )
      result = await checkAccountsFile()
    }

    return result ?? '[]'
  }
}
