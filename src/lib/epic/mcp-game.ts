import axios from 'axios'

import { fortnitePCGameClient } from '../../config/fortnite/clients'
import { AccountsManager } from '../../kernel/startup/accounts'
import {
  createAccessTokenUsingExchange,
  getAccessTokenUsingDeviceAuth,
  getExchangeCode,
} from '../../services/endpoints/oauth'

const HOTCONFIG_URL =
  'https://fn-hotconfigs.ogs.live.on.epicgames.com/hotconfigs/v2/livefn.json'
const DEFAULT_MCP_HOST = 'mcp-gc.live.fngw.ol.epicgames.com'

let mcpHostCache: string | null = null
let fortniteTokenCache: { token: string; expiresAt: number } | null = null
let fortniteTokenInFlight: Promise<string> | null = null

type HotConfigResponse = {
  HotConfigData?: Array<{
    Modules?: Array<{
      ModuleName?: string
      Endpoints?: {
        Windows?: string
        Default?: string
      }
    }>
  }>
}

export async function resolveGameServiceMcpHost(): Promise<string> {
  if (mcpHostCache) {
    return mcpHostCache
  }

  try {
    const response = await axios.get<HotConfigResponse>(HOTCONFIG_URL, {
      timeout: 15_000,
    })

    for (const app of response.data.HotConfigData ?? []) {
      for (const module of app.Modules ?? []) {
        if (module.ModuleName !== 'GameServiceMcp') {
          continue
        }

        const host = module.Endpoints?.Windows ?? module.Endpoints?.Default
        if (host) {
          mcpHostCache = host.replace(/^https?:\/\//, '').split('/')[0]
          return mcpHostCache
        }
      }
    }
  } catch {
    // fall through to the captured Windows MCP host
  }

  mcpHostCache = DEFAULT_MCP_HOST
  return mcpHostCache
}

export function invalidateFortnitePcUserAccessToken() {
  fortniteTokenCache = null
}

export async function getFortnitePcUserAccessToken(): Promise<string> {
  if (
    fortniteTokenCache &&
    Date.now() < fortniteTokenCache.expiresAt - 60_000
  ) {
    return fortniteTokenCache.token
  }

  if (fortniteTokenInFlight) {
    return fortniteTokenInFlight
  }

  fortniteTokenInFlight = issueFortnitePcUserAccessToken().finally(() => {
    fortniteTokenInFlight = null
  })

  return fortniteTokenInFlight
}

async function issueFortnitePcUserAccessToken(): Promise<string> {
  if (!AccountsManager.getAccounts().first()) {
    await Promise.race([
      AccountsManager.waitUntilLoaded(),
      new Promise<void>((resolve) => setTimeout(resolve, 8_000)),
    ])
  }

  const account = AccountsManager.getAccounts().first()
  if (!account?.accountId || !account.deviceId || !account.secret) {
    throw new Error(
      'No device_auth account — world/info requires a user token'
    )
  }

  const deviceAuth = await getAccessTokenUsingDeviceAuth({
    accountId: account.accountId,
    deviceId: account.deviceId,
    secret: account.secret,
    token_type: 'eg1',
  })
  const androidToken = deviceAuth.data.access_token
  if (!androidToken) {
    throw new Error('Brak access_token w device_auth')
  }

  const exchange = await getExchangeCode({
    headers: {
      Authorization: `bearer ${androidToken}`,
    },
    params: {
      consumingClientId: fortnitePCGameClient.clientId,
    },
  })
  const code = exchange.data.code
  if (!code) {
    throw new Error('Brak exchange code')
  }

  const fortnite = await createAccessTokenUsingExchange(
    {
      exchange_code: code,
      token_type: 'eg1',
    },
    {
      headers: {
        Authorization: `basic ${fortnitePCGameClient.auth}`,
        'X-Epic-Device-ID': account.deviceId,
      },
    }
  )
  const token = fortnite.data.access_token
  if (!token) {
    throw new Error('Brak Fortnite PC access_token')
  }

  const expiresAt = fortnite.data.expires_at
    ? Date.parse(fortnite.data.expires_at)
    : Date.now() + (fortnite.data.expires_in ?? 7200) * 1000

  fortniteTokenCache = {
    token,
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : Date.now() + 7200_000,
  }

  return token
}
