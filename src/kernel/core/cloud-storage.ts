import type { AccountData } from '../../types/accounts'
import type {
  CloudStorageApplyAccountResult,
  CloudStorageApplyRequest,
  CloudStorageDownloadRequest,
  CloudStorageDownloadResult,
  CloudStorageFileActionResult,
  CloudStorageFileInfo,
  CloudStorageListResult,
  CloudStorageLocalFile,
  CloudStoragePickResult,
} from '../../types/cloud-storage'

import { readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import axios from 'axios'
import { dialog } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { Authentication } from './authentication'
import { MainWindow } from '../startup/windows/main'

import {
  downloadUserCloudStorageFile,
  listUserCloudStorageFiles,
  uploadUserCloudStorageFile,
  type CloudStorageRemoteFile,
} from '../../services/endpoints/cloudstorage'

const UUID_SAV =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_r\d+_a\d+\.sav$/i

const RESTRICTED_FILES = new Set(['ClientSettingsSwitch.Sav'])

function isFileAllowed(filename: string) {
  if (!filename || RESTRICTED_FILES.has(filename)) {
    return false
  }

  return !UUID_SAV.test(filename)
}

function epicError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Unknown Error'
  }

  const data = error.response?.data

  if (data instanceof ArrayBuffer || Buffer.isBuffer(data)) {
    try {
      const parsed = JSON.parse(Buffer.from(data).toString('utf8')) as {
        errorMessage?: string
      }

      if (parsed?.errorMessage) {
        return parsed.errorMessage
      }
    } catch {
      // fall through
    }
  }

  if (data && typeof data === 'object' && 'errorMessage' in data) {
    return String((data as { errorMessage?: string }).errorMessage)
  }

  return error.message || 'Unknown Error'
}

function mapRemoteFile(file: CloudStorageRemoteFile): CloudStorageFileInfo | null {
  const uniqueFilename = file.uniqueFilename || file.filename

  if (!uniqueFilename || !isFileAllowed(uniqueFilename)) {
    return null
  }

  return {
    uniqueFilename,
    filename: file.filename || uniqueFilename,
    length: file.length ?? 0,
    uploaded: file.uploaded || file.lastModified || null,
  }
}

async function readRemoteFile(account: AccountData, filename: string) {
  const accessToken = await Authentication.verifyAccessToken(account)

  if (!accessToken) {
    throw new Error('Unknown Error')
  }

  const response = await downloadUserCloudStorageFile({
    accessToken,
    accountId: account.accountId,
    filename,
  })

  return Buffer.from(response.data)
}

export class CloudStorage {
  static async list(account: AccountData) {
    const result: CloudStorageListResult = {
      accountId: account.accountId,
      available: true,
      files: [],
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        result.available = false
        result.errorMessage = 'Unknown Error'
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.CloudStorageListNotification,
          result,
        )

        return
      }

      const response = await listUserCloudStorageFiles({
        accessToken,
        accountId: account.accountId,
      })
      const files = Array.isArray(response.data) ? response.data : []

      result.files = files
        .map(mapRemoteFile)
        .filter((file): file is CloudStorageFileInfo => file !== null)

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.CloudStorageListNotification,
        result,
      )
    } catch (error) {
      result.available = false
      result.errorMessage = epicError(error)
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.CloudStorageListNotification,
        result,
      )
    }
  }

  static async download(payload: CloudStorageDownloadRequest) {
    const empty: CloudStorageDownloadResult = {
      canceled: true,
      directory: null,
      results: [],
    }

    try {
      const selected = payload.filenames.filter(isFileAllowed)

      if (selected.length <= 0) {
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.CloudStorageDownloadNotification,
          empty,
        )

        return
      }

      const dialogResult = await dialog.showOpenDialog(MainWindow.instance, {
        properties: ['openDirectory', 'createDirectory'],
      })

      if (dialogResult.canceled || !dialogResult.filePaths[0]) {
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.CloudStorageDownloadNotification,
          empty,
        )

        return
      }

      const directory = dialogResult.filePaths[0]
      const results: Array<CloudStorageFileActionResult> = []

      for (const filename of selected) {
        try {
          const data = await readRemoteFile(payload.account, filename)
          const target = path.join(directory, path.basename(filename))

          await writeFile(target, data)
          results.push({ filename, ok: true })
        } catch (error) {
          results.push({
            filename,
            ok: false,
            errorMessage: epicError(error),
          })
        }
      }

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.CloudStorageDownloadNotification,
        {
          canceled: false,
          directory,
          results,
        },
      )
    } catch (error) {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.CloudStorageDownloadNotification,
        {
          canceled: false,
          directory: null,
          results: [
            {
              filename: '',
              ok: false,
              errorMessage: epicError(error),
            },
          ],
        },
      )
    }
  }

  static async pick() {
    const empty: CloudStoragePickResult = {
      canceled: true,
      files: [],
    }

    try {
      const dialogResult = await dialog.showOpenDialog(MainWindow.instance, {
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Cloud storage', extensions: ['Sav', 'sav'] },
          { name: 'All files', extensions: ['*'] },
        ],
      })

      if (dialogResult.canceled || dialogResult.filePaths.length <= 0) {
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.CloudStoragePickNotification,
          empty,
        )

        return
      }

      const files: Array<CloudStorageLocalFile> = []

      for (const filePath of dialogResult.filePaths) {
        const filename = path.basename(filePath)

        if (!isFileAllowed(filename)) {
          continue
        }

        const info = await stat(filePath)

        if (!info.isFile()) {
          continue
        }

        files.push({
          path: filePath,
          filename,
          length: info.size,
        })
      }

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.CloudStoragePickNotification,
        {
          canceled: false,
          files,
        },
      )
    } catch {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.CloudStoragePickNotification,
        empty,
      )
    }
  }

  static async apply(payload: CloudStorageApplyRequest) {
    const selected = payload.source
      ? payload.filenames.filter(isFileAllowed)
      : []
    const localFiles = (payload.localFiles ?? []).filter((file) =>
      isFileAllowed(file.filename || path.basename(file.path)),
    )
    const emptyResults: Array<CloudStorageApplyAccountResult> = []

    if (
      (selected.length <= 0 && localFiles.length <= 0) ||
      payload.destinations.length <= 0
    ) {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.CloudStorageApplyNotification,
        emptyResults,
      )

      return
    }

    const bodies = new Map<string, Buffer>()

    try {
      if (payload.source) {
        for (const filename of selected) {
          bodies.set(filename, await readRemoteFile(payload.source, filename))
        }
      }

      for (const file of localFiles) {
        const filename = file.filename || path.basename(file.path)

        bodies.set(filename, await readFile(file.path))
      }
    } catch (error) {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.CloudStorageApplyNotification,
        payload.destinations.map((account) => ({
          accountId: account.accountId,
          available: false,
          errorMessage: epicError(error),
          files: [],
        })),
      )

      return
    }

    const responses = await Promise.allSettled(
      payload.destinations.map(async (account) => {
        return CloudStorage.applyToAccount(account, bodies)
      }),
    )

    const data = responses.flatMap((response) =>
      response.status === 'fulfilled' ? [response.value] : [],
    )

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.CloudStorageApplyNotification,
      data,
    )
  }

  private static async applyToAccount(
    account: AccountData,
    bodies: Map<string, Buffer>,
  ): Promise<CloudStorageApplyAccountResult> {
    const result: CloudStorageApplyAccountResult = {
      accountId: account.accountId,
      available: true,
      files: [],
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        result.available = false
        result.errorMessage = 'Unknown Error'

        return result
      }

      for (const [filename, data] of bodies) {
        try {
          await uploadUserCloudStorageFile({
            accessToken,
            accountId: account.accountId,
            filename,
            data,
          })
          result.files.push({ filename, ok: true })
        } catch (error) {
          result.files.push({
            filename,
            ok: false,
            errorMessage: epicError(error),
          })
        }
      }
    } catch (error) {
      result.available = false
      result.errorMessage = epicError(error)
    }

    return result
  }
}
