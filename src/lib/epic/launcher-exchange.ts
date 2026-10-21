import { launcherAppClient2 } from '../../config/fortnite/clients'

import {
  getAccessTokenUsingExchangeCode,
  getExchangeCodeUsingAccessToken,
} from '../../services/endpoints/oauth'

export async function getLauncherExchangeCode(
  accountAccessToken: string,
): Promise<string | null> {
  const accountExchange = await getExchangeCodeUsingAccessToken(accountAccessToken)
  if (!accountExchange.data.code) return null

  const launcherAccessToken = await getAccessTokenUsingExchangeCode(
    accountExchange.data.code,
    {
      headers: {
        Authorization: `basic ${launcherAppClient2.auth}`,
      },
    },
  )
  if (!launcherAccessToken.data.access_token) return null

  const launcherExchange = await getExchangeCodeUsingAccessToken(
    launcherAccessToken.data.access_token,
  )

  return launcherExchange.data.code ?? null
}