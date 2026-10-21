import { cloudStorageService } from '../config/cloudstorage'

export type CloudStorageRemoteFile = {
  uniqueFilename?: string
  filename?: string
  length?: number
  uploaded?: string
  lastModified?: string
}

export function listUserCloudStorageFiles({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return cloudStorageService.get<Array<CloudStorageRemoteFile>>(
    `/user/${accountId}`,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    },
  )
}

export function downloadUserCloudStorageFile({
  accessToken,
  accountId,
  filename,
}: {
  accessToken: string
  accountId: string
  filename: string
}) {
  return cloudStorageService.get<ArrayBuffer>(
    `/user/${accountId}/${encodeURIComponent(filename)}`,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
      responseType: 'arraybuffer',
    },
  )
}

export function uploadUserCloudStorageFile({
  accessToken,
  accountId,
  filename,
  data,
}: {
  accessToken: string
  accountId: string
  filename: string
  data: Buffer
}) {
  return cloudStorageService.put(
    `/user/${accountId}/${encodeURIComponent(filename)}`,
    data,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
      },
      transformRequest: [(body) => body],
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: (status) => status >= 200 && status < 300,
    },
  )
}
