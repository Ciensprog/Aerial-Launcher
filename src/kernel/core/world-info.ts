import type { AccountData } from '../../types/accounts'
import type {
  SaveWorldInfoData,
  WorldInfoDeleteResponse,
  WorldInfoExportResponse,
  WorldInfoFileData,
  WorldInfoOpenResponse,
  WorldInfoParsed,
  WorldInfoResponse,
} from '../../types/data/advanced-mode/world-info'

import crypto from 'node:crypto'
import {
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import { dialog, shell } from 'electron'

import { defaultWorldInfo } from '../../config/constants/fortnite/world-info'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'
import { defaultFortniteClient } from '../../config/fortnite/clients'

import { MainWindow } from '../startup/windows/main'
import { AccountsManager } from '../startup/accounts'
import { DataDirectory } from '../startup/data-directory'
import { Authentication } from './authentication'

import { getWorldInfoData } from '../../services/endpoints/advanced-mode/world-info'
import { createAccessTokenUsingClientCredentials } from '../../services/endpoints/oauth'

import { localeCompareForSorting } from '../../lib/utils'

export class WorldInfoManager {
  static async requestForHome() {
    try {
      const response = await WorldInfoManager.request()

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.HomeWorldInfoResponse,
        response as WorldInfoParsed
      )

      return

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.HomeWorldInfoResponse,
      defaultWorldInfo
    )
  }

  static async requestForAdvanceSection() {
    try {
      const response = await WorldInfoManager.request()

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.WorldInfoResponseData,
        {
          data: response,
          status: true,
        } as WorldInfoResponse
      )

      return

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.WorldInfoResponseData,
      {
        data: null,
        status: false,
      } as WorldInfoResponse
    )
  }

  static async saveFile(value: SaveWorldInfoData) {
    let status = false

    try {
      await DataDirectory.checkOrCreateWorldInfoDirectory()
      await writeFile(
        path.join(
          DataDirectory.getWorldInfoDirectoryPath(),
          `${value.filename}.json`
        ),
        JSON.stringify(value.data, null, 2),
        {
          encoding: 'utf8',
        }
      )

      status = true

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.WorldInfoSaveNotification,
      status
    )
  }

  static async requestFiles() {
    try {
      const basePath = DataDirectory.getWorldInfoDirectoryPath()
      const dir = await readdir(basePath)

      const getFileData = async (filename: string) => {
        try {
          const filePath = path.join(basePath, filename)
          const stats = await stat(filePath)

          if (
            !stats.isFile() ||
            (stats.isFile() && !filename.endsWith('.json'))
          ) {
            return null
          }

          // const file = await readFile(filePath, {
          //   encoding: 'utf8',
          // })

          // const parsedJson = JSON.parse(file)
          const data: WorldInfoFileData = {
            createdAt: stats.birthtime,
            date: stats.birthtime,
            data: null, // parsedJson,
            filename: filename.replace('.json', ''),
            id: crypto.randomUUID(),
            size: stats.size,
          }

          return data

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          //
        }

        return null
      }

      Promise.allSettled(dir.map(getFileData)).then((responseFiles) => {
        const filtered = responseFiles
          .filter((response) => response.status === 'fulfilled')
          .map(
            (response) =>
              (response as PromiseFulfilledResult<WorldInfoFileData>).value
          ) as Array<WorldInfoFileData>

        const sortedFiles = filtered.toSorted(
          (itemA, itemB) =>
            (itemB.createdAt?.getTime() ?? 0) -
              (itemA.createdAt?.getTime() ?? 0) ||
            localeCompareForSorting(itemB.filename, itemA.filename)
        )

        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.WorldInfoResponseFiles,
          sortedFiles
        )
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }
  }

  static async deleteFile(data: WorldInfoFileData) {
    const response: WorldInfoDeleteResponse = {
      filename: data.filename,
      status: false,
    }

    try {
      await rm(
        path.join(
          DataDirectory.getWorldInfoDirectoryPath(),
          `${data.filename}.json`
        )
      )

      response.status = true

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.WorldInfoDeleteNotification,
      response
    )
  }

  static async exportWorldInfoFile(value: WorldInfoFileData) {
    const defaultResponse = () => {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.WorldInfoExportFileNotification,
        {
          status: 'canceled',
        } as WorldInfoExportResponse
      )
    }

    try {
      const response = await dialog.showSaveDialog({
        defaultPath: `${value.filename}.json`,
        filters: [
          {
            extensions: ['json'],
            name: 'World Info',
          },
        ],
      })

      if (response.canceled || !response.filePath) {
        defaultResponse()

        return
      }

      try {
        const basePath = DataDirectory.getWorldInfoDirectoryPath()
        const filePath = path.join(basePath, `${value.filename}.json`)

        const file = await readFile(filePath, {
          encoding: 'utf8',
        })
        const parsedJson = JSON.parse(file)

        await writeFile(
          response.filePath,
          JSON.stringify(parsedJson, null, 2),
          {
            encoding: 'utf8',
          }
        )

        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.WorldInfoExportFileNotification,
          {
            status: 'success',
          } as WorldInfoExportResponse
        )

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.WorldInfoExportFileNotification,
          {
            status: 'error',
          } as WorldInfoExportResponse
        )
      }

      return

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    defaultResponse()
  }

  static async openWorldInfoFile({ filename }: WorldInfoFileData) {
    const response: WorldInfoOpenResponse = {
      filename,
      status: false,
    }

    try {
      await shell.openPath(
        path.join(
          DataDirectory.getWorldInfoDirectoryPath(),
          `${filename}.json`
        )
      )

      response.status = true

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.WorldInfoOpenFileNotification,
      response
    )
  }

  static async renameFile(data: WorldInfoFileData, newFilename: string) {
    let status = false

    try {
      const baseFilePath = path.join(
        DataDirectory.getWorldInfoDirectoryPath(),
        `${data.filename}.json`
      )
      const newFilePath = path.join(
        DataDirectory.getWorldInfoDirectoryPath(),
        `${newFilename}.json`
      )

      try {
        await readFile(newFilePath, {
          encoding: 'utf8',
        })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        await rename(baseFilePath, newFilePath)

        status = true
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.WorldInfoRenameFileNotification,
      status
    )
  }

  /**
   * Max accounts to try before giving up, so one account with a broken
   * device auth doesn't leave the home tab empty
   */
  private static readonly maxAccountAttempts = 3

  private static async request() {
    // Since late 2026 Epic rejects client-credentials tokens on /world/info
    // (403 errors.com.epicgames.fortnite.client_token.forbidden: "Client
    // credentials must hold dedicated-server permission"), so the home tab
    // got an empty world info. Request it with a logged-in account instead.
    const accounts = await WorldInfoManager.getAccountsForRequest()

    for (const account of accounts.slice(
      0,
      WorldInfoManager.maxAccountAttempts,
    )) {
      try {
        const accessToken = await Authentication.verifyAccessToken(account)

        if (!accessToken) {
          continue
        }

        const data = await WorldInfoManager.fetchWorldInfo(accessToken)

        if (data) {
          return data
        }
      } catch (error) {
        console.error(
          `[WorldInfo] Request failed using account ${account.accountId}:`,
          WorldInfoManager.describeError(error),
        )
      }
    }

    // Fallback (no accounts added yet, or every account failed): keep the
    // old anonymous request in case Epic restores access for it
    try {
      const accessToken = await createAccessTokenUsingClientCredentials({
        authorization: defaultFortniteClient.use.auth,
      })

      if (accessToken.data.access_token) {
        const data = await WorldInfoManager.fetchWorldInfo(
          accessToken.data.access_token,
        )

        if (data) {
          return data
        }
      }
    } catch (error) {
      console.error(
        '[WorldInfo] Request failed using client credentials:',
        WorldInfoManager.describeError(error),
      )
    }

    return defaultWorldInfo
  }

  private static async fetchWorldInfo(accessToken: string) {
    const worldInfoResponse = await getWorldInfoData({
      accessToken,
    })

    if (
      !(worldInfoResponse.data.missionAlerts?.length > 0) ||
      !(worldInfoResponse.data.missions?.length > 0) ||
      !(worldInfoResponse.data.theaters?.length > 0)
    ) {
      return null
    }

    return worldInfoResponse.data
  }

  /**
   * The renderer asks for world info on mount, which can happen before it
   * asked the main process to load accounts, so read the file if needed
   */
  private static async getAccountsForRequest(): Promise<Array<AccountData>> {
    const loaded = [...AccountsManager.getAccounts().values()]

    if (loaded.length > 0) {
      return loaded
    }

    try {
      const { accounts } = await DataDirectory.getAccountsFile()

      return accounts.map((account) => ({
        ...account,
        accessToken: undefined,
      }))
    } catch (error) {
      console.error('[WorldInfo] Could not read accounts file:', error)
    }

    return []
  }

  private static describeError(error: unknown) {
    const response = (
      error as { response?: { status?: number; data?: unknown } }
    )?.response

    return response
      ? `${response.status} ${JSON.stringify(response.data)}`
      : error
  }
}
