import type { AccountData } from '../../types/accounts'
import type {
  AccountExportAccountResult,
  AccountExportRequest,
  AccountExportResult,
} from '../../types/account-export'

import { writeFile } from 'node:fs/promises'
import path from 'node:path'

import axios from 'axios'
import { dialog } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { Authentication } from './authentication'
import { DevicesAuthManager } from './devices-auth'
import { MainWindow } from '../startup/windows/main'

import { listUserCloudStorageFiles } from '../../services/endpoints/cloudstorage'
import {
  getFriendsBlocklist,
  getFriendsSettings,
  getFriendsSummary,
} from '../../services/endpoints/friends'
import {
  findUserByAccountId,
  findUsersByAccountIds,
  getAccountExternalAuths,
} from '../../services/endpoints/lookup'
import {
  getAccountPrivacy,
  getBrInventory,
  getQueryPublicProfile,
  queryProfile,
} from '../../services/endpoints/mcp'
import { oauthVerify } from '../../services/endpoints/oauth'
import { getLastOnline } from '../../services/endpoints/presence'
import { getAccountReceipts } from '../../services/endpoints/storefront'

import { getDateWithDefaultFormat } from '../../lib/dates'
import { parseCustomDisplayName } from '../../lib/utils'

const PROFILE_IDS = [
  'common_core',
  'common_public',
  'campaign',
  'athena',
  'metadata',
  'collections',
  'outpost0',
  'creative',
  'collection_book_people0',
  'collection_book_schematics0',
  'theater0',
  'recycle_bin',
]

const FRIEND_LOOKUP_CHUNK = 50

function epicError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Unknown Error'
  }

  const data = error.response?.data

  if (data && typeof data === 'object' && 'errorMessage' in data) {
    return String((data as { errorMessage?: string }).errorMessage)
  }

  return error.message || 'Unknown Error'
}

async function capture(label: string, task: () => Promise<unknown>) {
  try {
    return {
      ok: true as const,
      label,
      data: await task(),
    }
  } catch (error) {
    return {
      ok: false as const,
      label,
      error: epicError(error),
    }
  }
}

function safeFilePart(value: string) {
  const cleaned = value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').trim()

  return cleaned.slice(0, 60) || 'account'
}

function profileFromResponse(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null
  }

  const changes = (data as { profileChanges?: Array<{ profile?: unknown }> })
    .profileChanges

  return changes?.[0]?.profile ?? null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function summarizeCommonCore(profile: unknown) {
  const record = asRecord(profile)

  if (!record) {
    return null
  }

  const stats = asRecord(record.stats)
  const attributes = asRecord(stats?.attributes) ?? {}
  const items = asRecord(record.items) ?? {}
  const vbucks: Array<{ templateId: string; quantity: number; platform?: string }> =
    []

  Object.values(items).forEach((item) => {
    const row = asRecord(item)

    if (!row) {
      return
    }

    const templateId = String(row.templateId ?? '')

    if (!templateId.startsWith('Currency:')) {
      return
    }

    const itemAttributes = asRecord(row.attributes)

    vbucks.push({
      templateId,
      quantity: Number(row.quantity ?? 0),
      platform:
        typeof itemAttributes?.platform === 'string'
          ? itemAttributes.platform
          : undefined,
    })
  })

  return {
    homebaseName: attributes.homebase_name ?? null,
    mtxAffiliate: attributes.mtx_affiliate ?? null,
    giftHistory: attributes.gift_history ?? null,
    inAppPurchases: attributes.in_app_purchases ?? null,
    mtxPurchaseHistory: attributes.mtx_purchase_history ?? null,
    bans: attributes.ban_history ?? attributes.banStatus ?? null,
    vbucks,
    vbucksTotal: vbucks.reduce((sum, item) => sum + (item.quantity || 0), 0),
  }
}

function summarizeAthena(profile: unknown) {
  const record = asRecord(profile)

  if (!record) {
    return null
  }

  const items = asRecord(record.items) ?? {}
  const counts: Record<string, number> = {}
  const cosmetics: Array<string> = []

  Object.values(items).forEach((item) => {
    const row = asRecord(item)
    const templateId = String(row?.templateId ?? '')

    if (!templateId) {
      return
    }

    const prefix = templateId.split(':')[0] ?? 'unknown'

    if (prefix.toLowerCase().startsWith('athena') || prefix.toLowerCase().startsWith('sparks')) {
      counts[prefix] = (counts[prefix] ?? 0) + 1
      cosmetics.push(templateId)
    }
  })

  return {
    counts,
    cosmetics,
  }
}

function summarizeCampaign(profile: unknown) {
  const record = asRecord(profile)

  if (!record) {
    return null
  }

  const stats = asRecord(record.stats)
  const attributes = asRecord(stats?.attributes) ?? {}
  const items = asRecord(record.items) ?? {}
  let schematics = 0
  let heroes = 0
  let survivors = 0

  Object.values(items).forEach((item) => {
    const templateId = String(asRecord(item)?.templateId ?? '').toLowerCase()

    if (templateId.startsWith('schematic:')) {
      schematics += 1
    } else if (templateId.startsWith('hero:')) {
      heroes += 1
    } else if (templateId.startsWith('worker:')) {
      survivors += 1
    }
  })

  return {
    level: attributes.level ?? null,
    xp: attributes.xp ?? null,
    homebaseName: attributes.homebase_name ?? null,
    research_levels: attributes.research_levels ?? null,
    schematics,
    heroes,
    survivors,
  }
}

async function lookupFriendNames(
  accessToken: string,
  accountIds: Array<string>,
) {
  const unique = [...new Set(accountIds)].filter(Boolean)
  const names: Record<string, string> = {}

  for (let index = 0; index < unique.length; index += FRIEND_LOOKUP_CHUNK) {
    const chunk = unique.slice(index, index + FRIEND_LOOKUP_CHUNK)

    try {
      const response = await findUsersByAccountIds({
        accessToken,
        accountIds: chunk,
      })
      const rows = Array.isArray(response.data) ? response.data : []

      rows.forEach((row) => {
        if (row?.id && row.displayName) {
          names[row.id] = row.displayName
        }
      })
    } catch {
      // keep ids without names
    }
  }

  return names
}

function redactOauth(data: unknown) {
  const record = asRecord(data)

  if (!record) {
    return data
  }

  const copy = { ...record }

  delete copy.token
  delete copy.access_token
  delete copy.refresh_token

  return copy
}

function sanitizeDevices(data: unknown) {
  if (!Array.isArray(data)) {
    return data
  }

  return data.map((row) => {
    const record = asRecord(row)

    if (!record) {
      return row
    }

    const copy = { ...record }

    delete copy.isDeleting
    delete copy.secret

    return copy
  })
}

function captured(result: {
  ok: boolean
  data?: unknown
  error?: string
}) {
  return result.ok ? result.data : { error: result.error }
}

function profilePayload(value: unknown) {
  const record = asRecord(value)

  if (!record || 'error' in record) {
    return null
  }

  return profileFromResponse(record)
}

export class AccountExport {
  static async exportAccounts(payload: AccountExportRequest) {
    const empty: AccountExportResult = {
      canceled: true,
      directory: null,
      results: [],
    }

    try {
      if (payload.accounts.length <= 0) {
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.AccountExportNotification,
          empty,
        )

        return
      }

      const dialogResult = await dialog.showOpenDialog(MainWindow.instance, {
        properties: ['openDirectory', 'createDirectory'],
      })

      if (dialogResult.canceled || !dialogResult.filePaths[0]) {
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.AccountExportNotification,
          empty,
        )

        return
      }

      const directory = dialogResult.filePaths[0]
      const results: Array<AccountExportAccountResult> = []

      for (const account of payload.accounts) {
        results.push(await AccountExport.exportOne(account, directory))
      }

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.AccountExportNotification,
        {
          canceled: false,
          directory,
          results,
        },
      )
    } catch (error) {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.AccountExportNotification,
        {
          canceled: false,
          directory: null,
          results: payload.accounts.map((account) => ({
            accountId: account.accountId,
            ok: false,
            path: null,
            errorMessage: epicError(error),
          })),
        },
      )
    }
  }

  private static async exportOne(
    account: AccountData,
    directory: string,
  ): Promise<AccountExportAccountResult> {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        return {
          accountId: account.accountId,
          ok: false,
          path: null,
          errorMessage: 'Unknown Error',
        }
      }

      const dump = await AccountExport.collect(account, accessToken)
      const stamp = getDateWithDefaultFormat().replace(/[:.]/g, '-')
      const filename = `${safeFilePart(parseCustomDisplayName(account) || account.displayName)}-${account.accountId.slice(0, 8)}-recovery-${stamp}.json`
      const target = path.join(directory, filename)

      await writeFile(target, `${JSON.stringify(dump, null, 2)}\n`, 'utf8')

      return {
        accountId: account.accountId,
        ok: true,
        path: target,
      }
    } catch (error) {
      return {
        accountId: account.accountId,
        ok: false,
        path: null,
        errorMessage: epicError(error),
      }
    }
  }

  private static async collect(account: AccountData, accessToken: string) {
    const [
      accountInfo,
      externalAuths,
      oauth,
      devices,
      friends,
      friendsBlocklist,
      friendsSettings,
      lastOnline,
      receipts,
      privacy,
      cloudFiles,
      publicCampaign,
      brInventory,
    ] = await Promise.all([
      capture('account', async () => {
        const response = await findUserByAccountId({
          accessToken,
          accountId: account.accountId,
        })

        return response.data
      }),
      capture('externalAuths', async () => {
        const response = await getAccountExternalAuths({
          accessToken,
          accountId: account.accountId,
        })

        return response.data
      }),
      capture('oauthVerify', async () => {
        const response = await oauthVerify(accessToken)

        return redactOauth(response.data)
      }),
      capture('devicesAuth', async () => {
        return sanitizeDevices(await DevicesAuthManager.getList(account))
      }),
      capture('friends', async () => {
        const response = await getFriendsSummary({
          accessToken,
          accountId: account.accountId,
        })

        return response.data
      }),
      capture('friendsBlocklist', async () => {
        const response = await getFriendsBlocklist({
          accessToken,
          accountId: account.accountId,
        })

        return response.data
      }),
      capture('friendsSettings', async () => {
        const response = await getFriendsSettings({
          accessToken,
          accountId: account.accountId,
        })

        return response.data
      }),
      capture('lastOnline', async () => {
        const response = await getLastOnline({
          accessToken,
          accountId: account.accountId,
        })

        return response.data
      }),
      capture('receipts', async () => {
        const response = await getAccountReceipts({
          accessToken,
          accountId: account.accountId,
        })

        return response.data
      }),
      capture('privacy', async () => {
        const response = await getAccountPrivacy({
          accessToken,
          accountId: account.accountId,
        })

        return response.data
      }),
      capture('cloudStorage', async () => {
        const response = await listUserCloudStorageFiles({
          accessToken,
          accountId: account.accountId,
        })

        return response.data
      }),
      capture('queryPublicProfile', async () => {
        const response = await getQueryPublicProfile({
          accessToken,
          accountId: account.accountId,
        })

        return response.data
      }),
      capture('brInventory', async () => {
        const response = await getBrInventory({
          accessToken,
          accountId: account.accountId,
        })

        return response.data
      }),
    ])

    const profiles: Record<string, unknown> = {}

    for (let index = 0; index < PROFILE_IDS.length; index += 3) {
      const batch = PROFILE_IDS.slice(index, index + 3)
      const batchResults = await Promise.all(
        batch.map((profileId) =>
          capture(profileId, async () => {
            const response = await queryProfile({
              accessToken,
              accountId: account.accountId,
              profileId,
            })

            return response.data
          }),
        ),
      )

      batchResults.forEach((result) => {
        profiles[result.label] = result.ok
          ? result.data
          : { error: result.error }
      })
    }

    const friendsData = friends.ok ? asRecord(friends.data) : null
    const friendIds = [
      ...(((friendsData?.friends as Array<{ accountId?: string }>) ?? []).map(
        (row) => row.accountId ?? '',
      )),
      ...(((friendsData?.incoming as Array<{ accountId?: string }>) ?? []).map(
        (row) => row.accountId ?? '',
      )),
      ...(((friendsData?.outgoing as Array<{ accountId?: string }>) ?? []).map(
        (row) => row.accountId ?? '',
      )),
    ].filter(Boolean)

    const friendNames = await lookupFriendNames(
      accessToken,
      friendIds.slice(0, 200),
    )

    const commonCoreProfile = profilePayload(profiles.common_core)
    const athenaProfile = profilePayload(profiles.athena)
    const campaignProfile = profilePayload(profiles.campaign)
    const commonPublicProfile = profilePayload(profiles.common_public)

    const accountRecord = accountInfo.ok ? asRecord(accountInfo.data) : null

    return {
      exportedAt: getDateWithDefaultFormat(),
      purpose:
        'Epic Support account recovery evidence. Device secrets and access tokens are omitted.',
      aerial: {
        accountId: account.accountId,
        displayName: account.displayName,
        customDisplayName: account.customDisplayName ?? null,
        deviceId: account.deviceId,
        provider: account.provider ?? null,
      },
      summary: {
        accountId: account.accountId,
        displayName:
          (accountRecord?.displayName as string | undefined) ||
          account.displayName,
        email: accountRecord?.email ?? null,
        name: accountRecord?.name ?? null,
        lastName: accountRecord?.lastName ?? null,
        country: accountRecord?.country ?? null,
        preferredLanguage: accountRecord?.preferredLanguage ?? null,
        tfaEnabled: accountRecord?.tfaEnabled ?? null,
        emailVerified: accountRecord?.emailVerified ?? null,
        lastLogin: accountRecord?.lastLogin ?? null,
        failedLoginAttempts: accountRecord?.failedLoginAttempts ?? null,
        numberOfDisplayNameChanges:
          accountRecord?.numberOfDisplayNameChanges ?? null,
        canUpdateDisplayName: accountRecord?.canUpdateDisplayName ?? null,
        headless: accountRecord?.headless ?? null,
        ageGroup: accountRecord?.ageGroup ?? null,
        minorStatus: accountRecord?.minorStatus ?? null,
        linkedPlatforms: externalAuths.ok ? externalAuths.data : null,
        friends: {
          count: Array.isArray(friendsData?.friends)
            ? friendsData.friends.length
            : 0,
          incoming: Array.isArray(friendsData?.incoming)
            ? friendsData.incoming.length
            : 0,
          outgoing: Array.isArray(friendsData?.outgoing)
            ? friendsData.outgoing.length
            : 0,
          names: friendNames,
        },
        commonCore: summarizeCommonCore(commonCoreProfile),
        brLocker: summarizeAthena(athenaProfile),
        stw: summarizeCampaign(campaignProfile),
        commonPublic: summarizeCampaign(commonPublicProfile),
      },
      account: captured(accountInfo),
      externalAuths: captured(externalAuths),
      oauthVerify: captured(oauth),
      devicesAuth: captured(devices),
      friends: friends.ok
        ? { summary: friends.data, names: friendNames }
        : { error: friends.error },
      friendsBlocklist: captured(friendsBlocklist),
      friendsSettings: captured(friendsSettings),
      lastOnline: captured(lastOnline),
      receipts: captured(receipts),
      privacy: captured(privacy),
      cloudStorage: captured(cloudFiles),
      queryPublicProfile: captured(publicCampaign),
      brInventory: captured(brInventory),
      profiles,
    }
  }
}
