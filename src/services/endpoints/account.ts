import type { DeviceAuthListResponse } from '../../types/services/authorizations'

import { publicAccountService } from '../config/public-account'

export function getDevicesAuth({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return publicAccountService.get<DeviceAuthListResponse>(
    `/${accountId}/deviceAuth`,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    }
  )
}

export function removeDeviceAuth({
  accessToken,
  accountId,
  deviceId,
}: {
  accessToken: string
  accountId: string
  deviceId: string
}) {
  return publicAccountService.delete(
    `/${accountId}/deviceAuth/${deviceId}`,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    }
  )
}
