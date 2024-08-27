import type {
  SaveWorldInfoData,
  WorldInfoDeleteResponse,
  WorldInfoExportResponse,
  WorldInfoFileData,
  WorldInfoOpenResponse,
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

import { ElectronAPIEventKeys } from '../../config/constants/main-process'
import { defaultFortniteClient } from '../../config/fortnite/clients'

import { MainWindow } from '../startup/windows/main'
import { DataDirectory } from '../startup/data-directory'

import { getWorldInfoData } from '../../services/endpoints/advanced-mode/world-info'
import { createAccessTokenUsingClientCredentials } from '../../services/endpoints/oauth'

import { getDate } from '../../lib/dates'
import { localeCompareForSorting } from '../../lib/utils'

export class WorldInfoManager {
  static async requestData() {
    const defaultResponse = () => {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.WorldInfoResponseData,
        {
          data: null,
          status: false,
        } as WorldInfoResponse
      )
    }

    try {
      const accessToken = await createAccessTokenUsingClientCredentials({
        authorization: defaultFortniteClient.use.auth,
      })

      if (!accessToken.data.access_token) {
        defaultResponse()

        return
      }

      const worldInfoResponse = await getWorldInfoData({
        accessToken: accessToken.data.access_token,
      })

      if (
        worldInfoResponse.data.missionAlerts?.length <= 0 ||
        worldInfoResponse.data.missions?.length <= 0 ||
        worldInfoResponse.data.theaters?.length <= 0
      ) {
        defaultResponse()

        return
      }

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.WorldInfoResponseData,
        {
          data: worldInfoResponse.data,
          status: true,
        } as WorldInfoResponse
      )

      return
    } catch (error) {
      //
    }

    defaultResponse()
  }

  static async saveFile(value: SaveWorldInfoData) {
    let status = false

    try {
      await DataDirectory.checkOrCreateWorldInfoDirectory()
      await writeFile(
        path.join(
          DataDirectory.getWorldInfoDirectoryPath(),
          `${value.date}.json`
        ),
        JSON.stringify(value.data, null, 2),
        {
          encoding: 'utf8',
        }
      )

      status = true
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.WorldInfoSaveNotification,
      status
    )
  }

  static async requestFiles() {
    const files: Array<WorldInfoFileData> = []

    try {
      const basePath = DataDirectory.getWorldInfoDirectoryPath()
      const dir = await readdir(basePath)

      for (const filename of dir) {
        try {
          const filePath = path.join(basePath, filename)
          const file = await readFile(filePath, {
            encoding: 'utf8',
          })
          const stats = await stat(filePath)

          if (
            !stats.isFile() ||
            (stats.isFile() && !filename.endsWith('.json'))
          ) {
            continue
          }

          const parsedJson = JSON.parse(file)
          const data: WorldInfoFileData = {
            createdAt: stats.birthtime,
            date: getDate(stats.birthtime),
            data: parsedJson,
            filename: filename.replace('.json', ''),
            id: crypto.randomUUID(),
            size: stats.size,
          }

          files.push(data)
        } catch (error) {
          //
        }
      }
    } catch (error) {
      //
    }

    const sortedFiles = files.toSorted(
      (itemA, itemB) =>
        (itemB.createdAt?.getTime() ?? 0) -
          (itemA.createdAt?.getTime() ?? 0) ||
        localeCompareForSorting(itemB.filename, itemA.filename)
    )

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.WorldInfoResponseFiles,
      sortedFiles
    )
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
        await writeFile(
          response.filePath,
          JSON.stringify(value.data, null, 2),
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
      } catch (error) {
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.WorldInfoExportFileNotification,
          {
            status: 'error',
          } as WorldInfoExportResponse
        )
      }

      return
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
      } catch (error) {
        await rename(baseFilePath, newFilePath)

        status = true
      }
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.WorldInfoRenameFileNotification,
      status
    )
  }
}
