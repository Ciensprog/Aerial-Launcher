import type { AccountData } from './accounts'

export type CloudStorageFileInfo = {
  uniqueFilename: string
  filename: string
  length: number
  uploaded: string | null
}

export type CloudStorageListResult = {
  accountId: string
  available: boolean
  files: Array<CloudStorageFileInfo>
  errorMessage?: string
}

export type CloudStorageDownloadRequest = {
  account: AccountData
  filenames: Array<string>
}

export type CloudStorageFileActionResult = {
  filename: string
  ok: boolean
  errorMessage?: string
}

export type CloudStorageDownloadResult = {
  canceled: boolean
  directory: string | null
  results: Array<CloudStorageFileActionResult>
}

export type CloudStorageLocalFile = {
  path: string
  filename: string
  length: number
}

export type CloudStoragePickResult = {
  canceled: boolean
  files: Array<CloudStorageLocalFile>
}

export type CloudStorageApplyRequest = {
  source: AccountData | null
  filenames: Array<string>
  localFiles: Array<CloudStorageLocalFile>
  destinations: Array<AccountData>
}

export type CloudStorageApplyAccountResult = {
  accountId: string
  available: boolean
  errorMessage?: string
  files: Array<CloudStorageFileActionResult>
}
