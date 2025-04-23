import { storeAccessService } from '../config/store'

export function storeRequestAccess({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return storeAccessService.post<unknown>(
    `/request_access/${accountId}`,
    {},
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    }
  )
}
