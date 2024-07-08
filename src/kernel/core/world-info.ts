import type {
  SaveWorldInfoData,
  WorldInfoDeleteResponse,
  WorldInfoFileData,
  WorldInfoResponse,
} from '../../types/data/advanced-mode/world-info'

import crypto from 'node:crypto'
import { rm, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { BrowserWindow, dialog } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'
import { defaultFortniteClient } from '../../config/fortnite/clients'

import { getWorldInfoData } from '../../services/endpoints/advanced-mode/world-info'
import { createAccessTokenUsingClientCredentials } from '../../services/endpoints/oauth'
import { DataDirectory } from '../startup/data-directory'

import { getDate } from '../../lib/dates'

export class WorldInfoManager {
  static async requestData(currentWindow: BrowserWindow) {
    const defaultResponse = () => {
      currentWindow.webContents.send(
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

      currentWindow.webContents.send(
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

  static async saveFile(
    currentWindow: BrowserWindow,
    value: SaveWorldInfoData
  ) {
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

    currentWindow.webContents.send(
      ElectronAPIEventKeys.WorldInfoSaveNotification,
      status
    )
  }

  static async requestFiles(currentWindow: BrowserWindow) {
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

    const sortedFiles = files.toSorted((itemA, itemB) =>
      itemA.createdAt > itemB.createdAt ? -1 : 1
    )

    currentWindow.webContents.send(
      ElectronAPIEventKeys.WorldInfoResponseFiles,
      sortedFiles
    )
  }

  static async deleteFile(
    currentWindow: BrowserWindow,
    data: WorldInfoFileData
  ) {
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

    currentWindow.webContents.send(
      ElectronAPIEventKeys.WorldInfoDeleteNotification,
      response
    )
  }

  static async exportWorldInfoFile(
    currentWindow: BrowserWindow,
    value: WorldInfoFileData
  ) {
    const defaultResponse = () => {
      currentWindow.webContents.send(
        ElectronAPIEventKeys.WorldInfoExportFileNotification,
        {
          status: false,
        }
      )
    }

    try {
      const response = await dialog.showSaveDialog(currentWindow, {
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

      await writeFile(
        response.filePath,
        JSON.stringify(value.data, null, 2),
        {
          encoding: 'utf8',
        }
      )

      currentWindow.webContents.send(
        ElectronAPIEventKeys.WorldInfoExportFileNotification,
        {
          status: true,
        }
      )

      return
    } catch (error) {
      //
    }

    defaultResponse()
  }
}
