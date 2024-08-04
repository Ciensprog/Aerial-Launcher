import type {
  SaveWorldInfoData,
  WorldInfoFileData,
} from '../types/data/advanced-mode/world-info'
import type {
  AccountBasicInfo,
  AccountData,
  AccountDataList,
  AccountList,
} from '../types/accounts'
import type { AuthenticationByDeviceProperties } from '../types/authentication'
import type { GroupRecord } from '../types/groups'
import type { Settings } from '../types/settings'
import type { TagRecord } from '../types/tags'
import type {
  XPBoostsConsumePersonalData,
  XPBoostsConsumeTeammateData,
  XPBoostsSearchUserConfig,
} from '../types/xpboosts'

import path from 'node:path'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'
import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron'
import schedule from 'node-schedule'

import { ElectronAPIEventKeys } from '../config/constants/main-process'

import { AntiCheatProvider } from './core/anti-cheat-provider'
import { Authentication } from './core/authentication'
import { ClaimRewards } from './core/claim-rewards'
import { FortniteLauncher } from './core/launcher'
import { MCPClientQuestLogin, MCPHomebaseName } from './core/mcp'
import { MatchmakingTrack } from './core/matchmaking-track'
import { Manifest } from './core/manifest'
import { Party } from './core/party'
import { XPBoostsManager } from './core/xpboosts'
import { WorldInfoManager } from './core/world-info'
import { AccountsManager } from './startup/accounts'
import { Application } from './startup/application'
import { DataDirectory } from './startup/data-directory'
import { SettingsManager } from './startup/settings'
import { TagsManager } from './startup/tags'
import { GroupsManager } from './startup/groups'

dayjs.extend(relativeTime)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    center: true,
    frame: false,
    height: 600,
    width: 800,
    minHeight: 400,
    minWidth: 600,
    webPreferences: {
      devTools: !app.isPackaged,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: false,
    },
  })

  const manifest = Manifest.get()

  if (manifest) {
    mainWindow.webContents.setUserAgent(manifest.UserAgent)
  }

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools({
      mode: 'undocked',
    })

    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    await mainWindow.loadFile(
      path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
      )
    )
  }

  return mainWindow
}

Menu.setApplicationMenu(null)

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  await DataDirectory.createDataResources()

  const currentWindow = await createWindow()

  /**
   * Paths
   */

  ipcMain.on(ElectronAPIEventKeys.GetMatchmakingTrackPath, async () => {
    currentWindow.webContents.send(
      ElectronAPIEventKeys.GetMatchmakingTrackPathNotification,
      DataDirectory.matchmakingFilePath
    )
  })

  /**
   * Settings
   */

  ipcMain.on(ElectronAPIEventKeys.RequestAccounts, async () => {
    await AccountsManager.load(currentWindow)
  })

  ipcMain.on(ElectronAPIEventKeys.RequestSettings, async () => {
    await SettingsManager.load(currentWindow)
  })

  ipcMain.on(ElectronAPIEventKeys.RequestTags, async () => {
    await TagsManager.load(currentWindow)
  })

  ipcMain.on(ElectronAPIEventKeys.RequestGroups, async () => {
    await GroupsManager.load(currentWindow)
  })

  ipcMain.on(
    ElectronAPIEventKeys.UpdateSettings,
    async (_, settings: Settings) => {
      await SettingsManager.update(settings)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.UpdateTags,
    async (_, tags: TagRecord) => {
      await TagsManager.update(currentWindow, tags)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.UpdateGroups,
    async (_, groups: GroupRecord) => {
      await GroupsManager.update(groups)
    }
  )

  /**
   * General Methods
   */

  ipcMain.on(ElectronAPIEventKeys.OpenExternalURL, (_, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.on(ElectronAPIEventKeys.CloseWindow, () => {
    currentWindow.close()
  })

  ipcMain.on(ElectronAPIEventKeys.MinimizeWindow, () => {
    currentWindow.minimize()
  })

  /**
   * Events
   */

  ipcMain.on(
    ElectronAPIEventKeys.OnRemoveAccount,
    async (_, accountId: string) => {
      await AccountsManager.remove(accountId)
    }
  )

  /**
   * Requests
   */

  // ipcMain.on(
  //   ElectronAPIEventKeys.RequestProviderAndAccessTokenOnStartup,
  //   async (_, account: AccountData) => {
  //     const response = await AntiCheatProvider.request(account)

  //     currentWindow.webContents.send(
  //       ElectronAPIEventKeys.ResponseProviderAndAccessTokenOnStartup,
  //       response
  //     )
  //   }
  // )

  /**
   * Authentication
   */

  ipcMain.on(
    ElectronAPIEventKeys.CreateAuthWithExchange,
    async (_, code: string) => {
      await Authentication.exchange(currentWindow, code)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.CreateAuthWithAuthorization,
    async (_, code: string) => {
      await Authentication.authorization(currentWindow, code)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.CreateAuthWithDevice,
    async (_, data: AuthenticationByDeviceProperties) => {
      await Authentication.device(currentWindow, data)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.OpenEpicGamesSettings,
    async (_, account: AccountData) => {
      await Authentication.openEpicGamesSettings(currentWindow, account)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.GenerateExchangeCode,
    async (_, account: AccountData) => {
      await Authentication.generateExchangeCode(currentWindow, account)
    }
  )

  ipcMain.on(ElectronAPIEventKeys.RequestNewVersionStatus, async () => {
    await Application.checkVersion(currentWindow)
  })

  /**
   * Launcher
   */

  ipcMain.on(
    ElectronAPIEventKeys.LauncherStart,
    async (_, account: AccountData) => {
      await FortniteLauncher.start(currentWindow, account)
    }
  )

  /**
   * STW Operations
   */

  ipcMain.on(
    ElectronAPIEventKeys.SetSaveQuests,
    async (_, accounts: Array<AccountData>) => {
      await MCPClientQuestLogin.save(currentWindow, accounts)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.SetHombaseName,
    async (_, accounts: Array<AccountData>, homebaseName: string) => {
      await MCPHomebaseName.update(currentWindow, accounts, homebaseName)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.XPBoostsAccountProfileRequest,
    async (_, accounts: Array<AccountData>) => {
      await XPBoostsManager.requestAccounts(currentWindow, accounts)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.XPBoostsConsumePersonal,
    async (_, data: XPBoostsConsumePersonalData) => {
      await XPBoostsManager.consumePersonal(currentWindow, data)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.XPBoostsConsumeTeammate,
    async (_, data: XPBoostsConsumeTeammateData) => {
      await XPBoostsManager.consumeTeammate(currentWindow, data)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.XPBoostsSearchUser,
    async (_, config: XPBoostsSearchUserConfig) => {
      await XPBoostsManager.searchUser(
        ElectronAPIEventKeys.XPBoostsSearchUserNotification,
        currentWindow,
        config
      )
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.XPBoostsGeneralSearchUser,
    async (_, config: XPBoostsSearchUserConfig) => {
      await XPBoostsManager.generalSearchUser(currentWindow, config)
    }
  )

  /**
   * Party
   */

  ipcMain.on(
    ElectronAPIEventKeys.PartyClaimAction,
    async (_, selectedAccount: Array<AccountData>) => {
      await ClaimRewards.start(currentWindow, selectedAccount)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.PartyKickAction,
    async (
      _,
      selectedAccount: AccountData,
      accounts: AccountDataList,
      claimState: boolean
    ) => {
      await Party.kickPartyMembers(
        currentWindow,
        selectedAccount,
        accounts,
        claimState
      )
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.PartyLeaveAction,
    async (
      _,
      selectedAccounts: AccountList,
      accounts: AccountDataList,
      claimState: boolean
    ) => {
      await Party.leaveParty(
        currentWindow,
        selectedAccounts,
        accounts,
        claimState
      )
    }
  )

  ipcMain.on(ElectronAPIEventKeys.PartyLoadFriends, async () => {
    await Party.loadFriends(currentWindow)
  })

  ipcMain.on(
    ElectronAPIEventKeys.PartyAddNewFriendAction,
    async (_, account: AccountData, displayName: string) => {
      await Party.addNewFriend(currentWindow, account, displayName)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.PartyInviteAction,
    async (_, account: AccountData, accountIds: Array<string>) => {
      await Party.invite(currentWindow, account, accountIds)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.PartyRemoveFriendAction,
    async (
      _,
      data: {
        accountId: string
        displayName: string
      }
    ) => {
      await Party.removeFriend(currentWindow, data)
    }
  )

  /**
   * Advanced Mode
   */

  ipcMain.on(ElectronAPIEventKeys.WorldInfoRequestData, async () => {
    await WorldInfoManager.requestData(currentWindow)
  })

  ipcMain.on(
    ElectronAPIEventKeys.WorldInfoSaveFile,
    async (_, data: SaveWorldInfoData) => {
      await WorldInfoManager.saveFile(currentWindow, data)
    }
  )

  ipcMain.on(ElectronAPIEventKeys.WorldInfoRequestFiles, async () => {
    await WorldInfoManager.requestFiles(currentWindow)
  })

  ipcMain.on(
    ElectronAPIEventKeys.WorldInfoDeleteFile,
    async (_, data: WorldInfoFileData) => {
      await WorldInfoManager.deleteFile(currentWindow, data)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.WorldInfoExportFile,
    async (_, data: WorldInfoFileData) => {
      await WorldInfoManager.exportWorldInfoFile(currentWindow, data)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.WorldInfoOpenFile,
    async (_, data: WorldInfoFileData) => {
      await WorldInfoManager.openWorldInfoFile(currentWindow, data)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.WorldInfoRenameFile,
    async (_, data: WorldInfoFileData, newFilename: string) => {
      await WorldInfoManager.renameFile(currentWindow, data, newFilename)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.MatchmakingTrackSaveFile,
    async (_, account: AccountData, accountId: string) => {
      await MatchmakingTrack.saveFile(currentWindow, account, accountId)
    }
  )

  /**
   * Accounts
   */

  ipcMain.on(
    ElectronAPIEventKeys.UpdateAccountBasicInfo,
    async (_, account: AccountBasicInfo) => {
      await AccountsManager.add(account)
      currentWindow.webContents.send(
        ElectronAPIEventKeys.ResponseUpdateAccountBasicInfo
      )
    }
  )

  /**
   * Schedules
   */

  schedule.scheduleJob(
    {
      /**
       * Executes in every reset at time: 00:00:05 AM
       * Hour: 00
       * Minute: 00
       * Second: 05
       */
      rule: '5 0 0 * * *',
      /**
       * Time zone
       */
      tz: 'UTC',
    },
    () => {
      // currentWindow.webContents.send(
      //   ElectronAPIEventKeys.ScheduleRequestAccounts
      // )

      WorldInfoManager.requestData(currentWindow)
    }
  )

  ipcMain.on(
    ElectronAPIEventKeys.ScheduleResponseAccounts,
    (_, accounts: Array<AccountData>) => {
      AntiCheatProvider.requestBulk(currentWindow, accounts)
    }
  )
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    schedule.gracefulShutdown().catch(() => {})
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
