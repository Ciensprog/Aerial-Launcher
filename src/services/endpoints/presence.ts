import { presenceService } from '../config/presence'

export function getLastOnline({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return presenceService.get<unknown>(`/${accountId}/last-online`, {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  })
}
