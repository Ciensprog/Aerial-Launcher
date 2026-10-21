import type {
  SaveWorldInfoData,
  WorldInfoDailyFile,
  WorldInfoDeleteResponse,
  WorldInfoExportResponse,
  WorldInfoFileData,
  WorldInfoOpenResponse,
  WorldInfoParsed,
  WorldInfoResponse,
  WorldInfoSwapSources,
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

import { MainWindow } from '../startup/windows/main'
import { DataDirectory } from '../startup/data-directory'

import { getWorldInfoData } from '../../services/endpoints/advanced-mode/world-info'
import {
  getFortnitePcUserAccessToken,
  invalidateFortnitePcUserAccessToken,
} from '../../lib/epic/mcp-game'

import { localeCompareForSorting } from '../../lib/utils'
import {
  getWorldInfoMissionDay,
  shiftUtcDate,
} from '../../lib/misje/world-info-day'

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

  static async getSwapSources(todayDate?: string): Promise<WorldInfoSwapSources> {
    await DataDirectory.checkOrCreateWorldInfoDirectory()
    const directory = DataDirectory.getWorldInfoDirectoryPath()
    const files = await WorldInfoManager.listDailyFiles()
    const currentDay =
      todayDate && /^\d{4}-\d{2}-\d{2}$/.test(todayDate)
        ? todayDate
        : files.at(-1)?.date

    const today =
      files.find((file) => file.filename === currentDay) ??
      files.findLast((file) => file.date === currentDay) ??
      null

    const yesterdayDate = currentDay
      ? shiftUtcDate(currentDay, -1)
      : undefined
    const yesterday = yesterdayDate
      ? (files.find((file) => file.filename === yesterdayDate) ??
        files.findLast((file) => file.date === yesterdayDate) ??
        null)
      : null

    return {
      directory,
      today,
      yesterday,
    }
  }

  static async autoSaveDaily(data: WorldInfoParsed | typeof defaultWorldInfo) {
    if (!WorldInfoManager.isPopulated(data)) {
      return null
    }

    await DataDirectory.checkOrCreateWorldInfoDirectory()
    const filename = getWorldInfoMissionDay(data)
    const filePath = path.join(
      DataDirectory.getWorldInfoDirectoryPath(),
      `${filename}.json`,
    )

    await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, {
      encoding: 'utf8',
    })

    await WorldInfoManager.pruneOldDailyFiles(filename)

    return filePath
  }

  private static async pruneOldDailyFiles(today: string) {
    const yesterday = shiftUtcDate(today, -1)
    const keep = new Set(
      [`${today}.json`, `${yesterday}.json`].map((name) => name.toLowerCase()),
    )
    const directory = DataDirectory.getWorldInfoDirectoryPath()
    const names = await readdir(directory)

    await Promise.all(
      names.map(async (name) => {
        if (!name.toLowerCase().endsWith('.json')) {
          return
        }

        if (keep.has(name.toLowerCase())) {
          return
        }

        try {
          await rm(path.join(directory, name), { force: true })
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          //
        }
      }),
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

  private static requestInFlight: Promise<
    WorldInfoParsed | typeof defaultWorldInfo
  > | null = null

  private static async request() {
    if (WorldInfoManager.requestInFlight) {
      return WorldInfoManager.requestInFlight
    }

    WorldInfoManager.requestInFlight = WorldInfoManager.requestWithRetry()
      .then(async (data) => {
        if (WorldInfoManager.isPopulated(data)) {
          await WorldInfoManager.autoSaveDaily(data)
        }

        return data
      })
      .finally(() => {
        WorldInfoManager.requestInFlight = null
      })

    return WorldInfoManager.requestInFlight
  }

  private static async listDailyFiles() {
    const directory = DataDirectory.getWorldInfoDirectoryPath()
    const names = await readdir(directory)
    const files: Array<WorldInfoDailyFile> = []

    for (const name of names) {
      if (!name.toLowerCase().endsWith('.json')) {
        continue
      }

      if (name.toLowerCase().includes('swap')) {
        continue
      }

      const match = name.match(/^(\d{4}-\d{2}-\d{2})/)

      if (!match) {
        continue
      }

      files.push({
        date: match[1],
        filename: name.replace(/\.json$/i, ''),
        path: path.join(directory, name),
      })
    }

    files.sort(
      (fileA, fileB) =>
        fileA.date.localeCompare(fileB.date) ||
        fileA.filename.localeCompare(fileB.filename),
    )

    return files
  }

  private static isPopulated(data: WorldInfoParsed | typeof defaultWorldInfo) {
    return (
      (data.missionAlerts?.length ?? 0) > 0 &&
      (data.missions?.length ?? 0) > 0 &&
      (data.theaters?.length ?? 0) > 0
    )
  }

  private static async requestWithRetry() {
    const delays = [0, 400, 1000]

    for (let index = 0; index < delays.length; index += 1) {
      if (delays[index] > 0) {
        await new Promise((resolve) => setTimeout(resolve, delays[index]))
      }

      try {
        const data = await WorldInfoManager.fetchFromApi()
        if (WorldInfoManager.isPopulated(data)) {
          return data
        }
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response
          ?.status
        if (status === 401) {
          invalidateFortnitePcUserAccessToken()
        }
      }
    }

    return defaultWorldInfo
  }

  private static async fetchFromApi() {
    const accessToken = await getFortnitePcUserAccessToken()
    const worldInfoResponse = await getWorldInfoData({
      accessToken,
    })

    if (
      worldInfoResponse.data.missionAlerts?.length <= 0 ||
      worldInfoResponse.data.missions?.length <= 0 ||
      worldInfoResponse.data.theaters?.length <= 0
    ) {
      return defaultWorldInfo
    }

    return worldInfoResponse.data as WorldInfoParsed
  }
}
