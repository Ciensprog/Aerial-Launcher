import type { AccountData } from '../../../types/accounts'
import type {
  AutomationLogFilePlayer,
  AutomationLogFileSettings,
  AutomationLogFileStatus,
} from '../../../types/automation'

import { execFile } from 'node:child_process'
import { open, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

import { dialog } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'
import {
  defaultFortniteLogPath,
  FORTNITE_LOG_NAME_RE,
} from '../../../lib/fortnite/log-file'

import { AccountsManager } from '../../startup/accounts'
import { DataDirectory } from '../../startup/data-directory'
import { SettingsManager } from '../../startup/settings'
import { MainWindow } from '../../startup/windows/main'

import { ClaimRewards } from '../claim-rewards'
import { MCPStorageTransfer } from '../mcp/storage-transfer'
import { Party } from '../party'

const execFileAsync = promisify(execFile)

const LOGIN_MARK = 'Successfully logged in user'
const END_OF_MATCH_RE = /End of Match/i
const LOBBY_END_OF_MATCH_RE =
  /FrontEnd_GameState_C|FortGameStateHestiaBeauty/
const MATCH_COOLDOWN_MS = 25_000
const MATCH_SLEEP_MS = 3_000
const POLL_MS = 1_000
const MAX_READ_BYTES = 2 * 1024 * 1024
const LOGIN_SCAN_CHUNK = 512 * 1024

type FileCursor = {
  offset: number
  leftover: string
  accountId: string | null
  displayName: string | null
  lastMatchAt: number
}

export class AutomationLogFile {
  private static settings: AutomationLogFileSettings | null = null
  private static cursors = new Map<string, FileCursor>()
  private static timer: NodeJS.Timeout | null = null
  private static busy = false
  private static acting = false
  private static lastStatusJson = ''
  private static lastEvent: string | null = null
  private static stamp = 0
  private static fortniteRunning = false
  private static instanceCount = 0
  private static players: Array<AutomationLogFilePlayer> = []

  static async start() {
    if (!AutomationLogFile.settings) {
      AutomationLogFile.settings =
        await DataDirectory.getAutomationLogFile()
    }

    if (AutomationLogFile.timer) {
      return
    }

    await AutomationLogFile.tick()
    AutomationLogFile.timer = setInterval(() => {
      AutomationLogFile.tick().catch(() => {})
    }, POLL_MS)
  }

  static async getStatus(): Promise<AutomationLogFileStatus> {
    if (!AutomationLogFile.settings) {
      AutomationLogFile.settings =
        await DataDirectory.getAutomationLogFile()
    }

    return AutomationLogFile.buildStatus()
  }

  static async updateSettings(
    partial: Partial<AutomationLogFileSettings>,
  ) {
    if (!AutomationLogFile.settings) {
      AutomationLogFile.settings =
        await DataDirectory.getAutomationLogFile()
    }

    const next: AutomationLogFileSettings = {
      ...AutomationLogFile.settings,
      ...partial,
    }

    if (typeof next.logPath === 'string') {
      next.logPath = next.logPath.trim() || defaultFortniteLogPath()
    }

    const pathChanged =
      next.logPath !== AutomationLogFile.settings.logPath

    AutomationLogFile.settings = next
    await DataDirectory.updateAutomationLogFile(next)

    if (pathChanged) {
      AutomationLogFile.cursors.clear()
    }

    AutomationLogFile.pushStatus(true)
    await AutomationLogFile.start()
  }

  static async pickLogFile() {
    const current =
      AutomationLogFile.settings?.logPath || defaultFortniteLogPath()

    const result = await dialog.showOpenDialog(MainWindow.instance, {
      properties: ['openFile'],
      defaultPath: current,
      filters: [
        { name: 'Log files', extensions: ['log'] },
        { name: 'All files', extensions: ['*'] },
      ],
    })

    if (result.canceled || !result.filePaths[0]) {
      return
    }

    await AutomationLogFile.updateSettings({
      logPath: result.filePaths[0],
    })
  }

  private static buildStatus(): AutomationLogFileStatus {
    const settings =
      AutomationLogFile.settings ?? {
        logPath: defaultFortniteLogPath(),
        kick: false,
        claim: false,
        claimParty: false,
        transferMats: false,
      }

    return {
      ...settings,
      fortniteRunning: AutomationLogFile.fortniteRunning,
      instanceCount: AutomationLogFile.instanceCount,
      players: AutomationLogFile.players,
      lastEvent: AutomationLogFile.lastEvent,
      stamp: AutomationLogFile.stamp,
    }
  }

  private static pushStatus(force = false) {
    const status = AutomationLogFile.buildStatus()
    const json = JSON.stringify(status)

    if (!force && json === AutomationLogFile.lastStatusJson) {
      return
    }

    AutomationLogFile.lastStatusJson = json

    try {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.AutomationLogFileNotification,
        status,
      )
    } catch {
      // window not ready
    }
  }

  private static async tick() {
    if (AutomationLogFile.busy) {
      return
    }

    AutomationLogFile.busy = true

    try {
      if (!AutomationLogFile.settings) {
        AutomationLogFile.settings =
          await DataDirectory.getAutomationLogFile()
      }

      const settings = await SettingsManager.getData()
      const instanceCount = await countFortniteProcesses(
        settings.customProcess || 'FortniteClient-Win64-Shipping.exe',
      )

      AutomationLogFile.instanceCount = instanceCount
      AutomationLogFile.fortniteRunning = instanceCount > 0

      const files = await listInstanceLogs(
        AutomationLogFile.settings.logPath,
      )
      const active = new Set(files)
      const players: Array<AutomationLogFilePlayer> = []

      for (const filePath of files) {
        const lines = await AutomationLogFile.readNewLines(filePath)

        for (const line of lines) {
          await AutomationLogFile.handleLine(filePath, line)
        }

        const cursor = AutomationLogFile.cursors.get(filePath)

        players.push({
          file: path.basename(filePath),
          displayName: cursor?.displayName ?? null,
          accountId: cursor?.accountId ?? null,
        })
      }

      for (const key of AutomationLogFile.cursors.keys()) {
        if (!active.has(key)) {
          AutomationLogFile.cursors.delete(key)
        }
      }

      AutomationLogFile.players = players
      AutomationLogFile.pushStatus()
    } catch {
      // keep polling
    } finally {
      AutomationLogFile.busy = false
    }
  }

  private static async readNewLines(filePath: string) {
    let cursor = AutomationLogFile.cursors.get(filePath)

    try {
      const info = await stat(filePath)

      if (!cursor) {
        cursor = {
          offset: info.size,
          leftover: '',
          accountId: null,
          displayName: null,
          lastMatchAt: 0,
        }
        AutomationLogFile.cursors.set(filePath, cursor)
        await seedOldestLogin(filePath, cursor)

        return []
      }

      if (info.size < cursor.offset) {
        cursor.offset = info.size
        cursor.leftover = ''
        cursor.accountId = null
        cursor.displayName = null
        cursor.lastMatchAt = 0
        await seedOldestLogin(filePath, cursor)

        return []
      }

      if (info.size === cursor.offset) {
        return []
      }

      const handle = await open(filePath, 'r')

      try {
        let start = cursor.offset
        let length = info.size - start

        if (length > MAX_READ_BYTES) {
          start = info.size - MAX_READ_BYTES
          length = MAX_READ_BYTES
          cursor.leftover = ''
        }

        const buffer = Buffer.alloc(length)
        await handle.read(buffer, 0, length, start)
        cursor.offset = info.size
        const text = `${cursor.leftover}${buffer.toString('utf8')}`
        const parts = text.split(/\r?\n/)

        cursor.leftover = parts.pop() ?? ''

        return parts.filter((line) => line.length > 0)
      } finally {
        await handle.close()
      }
    } catch {
      return []
    }
  }

  private static async handleLine(filePath: string, line: string) {
    const cursor = AutomationLogFile.cursors.get(filePath)

    if (!cursor) {
      return
    }

    if (!cursor.accountId && !cursor.displayName) {
      const parsed = parseLoginLine(line)

      if (parsed) {
        cursor.accountId = parsed.accountId
        cursor.displayName = parsed.displayName
      }
    }

    if (!END_OF_MATCH_RE.test(line)) {
      return
    }

    if (LOBBY_END_OF_MATCH_RE.test(line)) {
      return
    }

    const now = Date.now()

    if (now - cursor.lastMatchAt < MATCH_COOLDOWN_MS) {
      return
    }

    cursor.lastMatchAt = now

    const label = cursor.displayName || cursor.accountId
    const settings = AutomationLogFile.settings

    if (
      !settings ||
      (!settings.kick && !settings.claim && !settings.transferMats)
    ) {
      AutomationLogFile.setEvent(
        label
          ? `End of match · ${label}`
          : 'End of match · no login yet',
      )

      return
    }

    if (!label) {
      AutomationLogFile.setEvent('End of match · no login yet')

      return
    }

    const account = findAccount(cursor.accountId, cursor.displayName)

    if (!account) {
      AutomationLogFile.setEvent(
        `End of match · ${label} · account not in Aerial`,
      )

      return
    }

    if (AutomationLogFile.acting) {
      return
    }

    AutomationLogFile.acting = true

    setTimeout(() => {
      AutomationLogFile.runActions(account, label, settings)
        .catch(() => {})
        .finally(() => {
          AutomationLogFile.acting = false
        })
    }, MATCH_SLEEP_MS)
  }

  private static async runActions(
    account: AccountData,
    displayName: string,
    settings: AutomationLogFileSettings,
  ) {
    const done: Array<string> = []

    try {
      const accounts = [...AccountsManager.getAccounts().values()]

      if (settings.claim) {
        if (settings.claimParty) {
          await Party.claimPartyMembers(account, accounts, {
            useGlobalNotification: true,
          })
        } else {
          await ClaimRewards.start([account], true)
        }

        done.push(settings.claimParty ? 'claim-party' : 'claim')
      }

      if (settings.kick) {
        await Party.kickPartyMembers(account, accounts, false, {
          useGlobalNotification: true,
        })
        done.push('kick')
      }

      if (settings.transferMats) {
        MCPStorageTransfer.buildingMaterials(account).catch(() => {})
        done.push('transfer')
      }

      AutomationLogFile.setEvent(
        `End of match · ${displayName} · ${done.join('+') || 'no actions'}`,
      )
    } catch (error) {
      AutomationLogFile.setEvent(
        `End of match · ${displayName} · ${
          error instanceof Error ? error.message : 'error'
        }`,
      )
    }
  }

  private static setEvent(message: string) {
    AutomationLogFile.lastEvent = message
    AutomationLogFile.stamp = Date.now()
    AutomationLogFile.pushStatus(true)
  }
}

function parseLoginLine(line: string) {
  if (!line.includes(LOGIN_MARK)) {
    return null
  }

  const userId = line.match(/UserId=\[([^\]]+)\]/)?.[1]?.trim() ?? ''
  const displayName =
    line.match(/DisplayName=\[([^\]]+)\]/)?.[1]?.trim() || null
  const epicRaw =
    line.match(/EpicAccountId=\[([^\]]+)\]/)?.[1]?.trim() ?? ''
  const accountId = (epicRaw.replace(/^MCP:/i, '') || userId).trim() || null

  if (!accountId && !displayName) {
    return null
  }

  return {
    accountId,
    displayName,
  }
}

async function seedOldestLogin(filePath: string, cursor: FileCursor) {
  try {
    const handle = await open(filePath, 'r')

    try {
      const info = await handle.stat()
      let pos = 0
      let leftover = ''

      while (pos < info.size && !cursor.accountId && !cursor.displayName) {
        const length = Math.min(LOGIN_SCAN_CHUNK, info.size - pos)
        const buffer = Buffer.alloc(length)
        await handle.read(buffer, 0, length, pos)
        pos += length
        const text = `${leftover}${buffer.toString('utf8')}`
        const lines = text.split(/\r?\n/)
        leftover = lines.pop() ?? ''

        for (const line of lines) {
          const parsed = parseLoginLine(line)

          if (parsed) {
            cursor.accountId = parsed.accountId
            cursor.displayName = parsed.displayName

            return
          }
        }
      }

      if (leftover) {
        const parsed = parseLoginLine(leftover)

        if (parsed) {
          cursor.accountId = parsed.accountId
          cursor.displayName = parsed.displayName
        }
      }
    } finally {
      await handle.close()
    }
  } catch {
    // file unreadable
  }
}

function findAccount(accountId: string | null, displayName: string | null) {
  const accounts = AccountsManager.getAccounts()

  if (accountId) {
    const needle = accountId.toLowerCase()
    const byId = accounts.find(
      (account) => account.accountId.toLowerCase() === needle,
    )

    if (byId) {
      return byId
    }
  }

  if (!displayName) {
    return undefined
  }

  const name = displayName.toLowerCase()

  return accounts.find((account) => {
    if (account.displayName.toLowerCase() === name) {
      return true
    }

    return account.customDisplayName?.toLowerCase() === name
  })
}

async function listInstanceLogs(logPath: string) {
  const target = logPath.trim() || defaultFortniteLogPath()
  const dir = path.dirname(target)
  const files = new Set<string>()

  try {
    const names = await readdir(dir)

    names.forEach((name) => {
      if (/backup/i.test(name)) {
        return
      }

      if (FORTNITE_LOG_NAME_RE.test(name)) {
        files.add(path.join(dir, name))
      }
    })
  } catch {
    // directory missing
  }

  files.add(path.normalize(target))

  const existing: Array<string> = []

  for (const filePath of files) {
    try {
      const info = await stat(filePath)

      if (info.isFile()) {
        existing.push(filePath)
      }
    } catch {
      // missing
    }
  }

  return existing.sort()
}

async function countFortniteProcesses(exeName: string) {
  const image = exeName.replace(/^.*[\\/]/, '') || exeName

  try {
    const { stdout } = await execFileAsync(
      'tasklist',
      ['/FI', `IMAGENAME eq ${image}`, '/FO', 'CSV', '/NH'],
      {
        windowsHide: true,
      },
    )

    return stdout
      .split(/\r?\n/)
      .filter((line) => line.toLowerCase().includes(image.toLowerCase()))
      .length
  } catch {
    return 0
  }
}
