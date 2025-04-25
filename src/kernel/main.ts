import type {
  SaveWorldInfoData,
  WorldInfoFileData,
} from '../types/data/advanced-mode/world-info'
import type {
  AccountBasicInfo,
  AccountData,
  AccountDataList,
  AccountDataRecord,
  AccountList,
} from '../types/accounts'
import type { AlertsDoneSearchPlayerConfig } from '../types/alerts'
import type { AuthenticationByDeviceProperties } from '../types/authentication'
import type { AutomationServiceActionConfig } from '../types/automation'
import type { GroupRecord } from '../types/groups'
import type { CustomizableMenuSettings, Settings } from '../types/settings'
import type { TagRecord } from '../types/tags'
import type {
  XPBoostsConsumePersonalData,
  XPBoostsConsumeTeammateData,
  XPBoostsSearchUserConfig,
} from '../types/xpboosts'

import path from 'node:path'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import dayjs from 'dayjs'
import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron'
import schedule from 'node-schedule'

import { ElectronAPIEventKeys } from '../config/constants/main-process'

import { AlertsDone } from './core/alerts'
// import { AntiCheatProvider } from './core/anti-cheat-provider'
import { Authentication } from './core/authentication'
import { ClaimRewards } from './core/claim-rewards'
import { DevicesAuthManager } from './core/devices-auth'
import { EULATracking } from './core/eula-tracking'
import { FortniteLauncher } from './core/launcher'
import { MCPClientQuestLogin, MCPHomebaseName } from './core/mcp'
import { MatchmakingTrack } from './core/matchmaking-track'
import { Manifest } from './core/manifest'
import { Party } from './core/party'
import { RedeemCodes } from './core/redeem-codes'
import { Storefront } from './core/storefront'
import { Unlock } from './core/unlock'
import { VBucksInformation } from './core/vbucks-information'
import { WorldInfoManager } from './core/world-info'
import { XPBoostsManager } from './core/xpboosts'
import { MainWindow } from './startup/windows/main'
import { AccountsManager } from './startup/accounts'
import { Application } from './startup/application'
import {
  AutoLlamas,
  ProcessAutoLlamas,
  ProcessLlamaType,
} from './startup/auto-llamas'
import { AutoPinUrns } from './startup/auto-pin-urns'
import { Automation } from './startup/automation'
import { DataDirectory } from './startup/data-directory'
import { GroupsManager } from './startup/groups'
import {
  AppLanguage,
  CustomizableMenuSettingsManager,
  DevSettingsManager,
  SettingsManager,
} from './startup/settings'
import { SystemTray } from './startup/system-tray'
import { TagsManager } from './startup/tags'

import {
  AutoLlamasAccountAddParams,
  AutoLlamasAccountUpdateParams,
} from '../state/stw-operations/auto/llamas'

import { Language } from '../locales/resources'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(utc)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line @typescript-eslint/no-require-imports
if (require('electron-squirrel-startup')) {
  app.quit()
}

const gotTheLock = app.requestSingleInstanceLock()

;(() => {
  if (!gotTheLock) {
    return app.quit()
  }

  const createWindow = async () => {
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

    const manifest = Manifest.getData()

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

  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (MainWindow.instance) {
      if (SystemTray.isActive) {
        if (!MainWindow.instance.isVisible()) {
          MainWindow.instance.show()
        }
      } else {
        if (MainWindow.instance.isMinimized()) {
          MainWindow.instance.restore()
        }
      }

      MainWindow.instance.focus()
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', async () => {
    DataDirectory.createDataResources().catch(() => {})

    MainWindow.setInstance(await createWindow())

    /**
     * Paths
     */

    ipcMain.on(ElectronAPIEventKeys.GetMatchmakingTrackPath, async () => {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.GetMatchmakingTrackPathNotification,
        DataDirectory.matchmakingFilePath
      )
    })

    /**
     * Settings
     */

    ipcMain.on(ElectronAPIEventKeys.AppLanguageRequest, async () => {
      await AppLanguage.load()
    })

    ipcMain.on(
      ElectronAPIEventKeys.AppLanguageUpdate,
      async (_, language: Language) => {
        await AppLanguage.update(language)
      }
    )

    ipcMain.on(ElectronAPIEventKeys.RequestAccounts, async () => {
      await AccountsManager.load()
    })

    ipcMain.on(ElectronAPIEventKeys.RequestSettings, async () => {
      await SettingsManager.load()
    })

    ipcMain.on(ElectronAPIEventKeys.DevSettingsRequest, async () => {
      await DevSettingsManager.load()
    })

    ipcMain.on(
      ElectronAPIEventKeys.CustomizableMenuSettingsRequest,
      async () => {
        await CustomizableMenuSettingsManager.load()
      }
    )

    ipcMain.on(ElectronAPIEventKeys.RequestTags, async () => {
      await TagsManager.load()
    })

    ipcMain.on(ElectronAPIEventKeys.RequestGroups, async () => {
      await GroupsManager.load()
    })

    ipcMain.on(
      ElectronAPIEventKeys.UpdateSettings,
      async (_, settings: Settings) => {
        await SettingsManager.update(settings)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.AccountsOrderingSync,
      async (_, accounts: AccountDataRecord) => {
        await AccountsManager.reorder(accounts)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.CustomizableMenuSettingsUpdate,
      async (
        _,
        key: keyof CustomizableMenuSettings,
        visibility: boolean
      ) => {
        await CustomizableMenuSettingsManager.update(key, visibility)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.UpdateTags,
      async (_, tags: TagRecord) => {
        await TagsManager.update(tags)
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
      if (SystemTray.isActive) {
        MainWindow.closeApp()
      } else {
        MainWindow.instance.close()
      }
    })

    ipcMain.on(ElectronAPIEventKeys.MinimizeWindow, () => {
      if (SystemTray.isActive) {
        MainWindow.instance.hide()
      } else {
        MainWindow.instance.minimize()
      }
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

    //     MainWindow.instance.webContents.send(
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
        await Authentication.exchange(code)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.CreateAuthWithAuthorization,
      async (_, code: string) => {
        await Authentication.authorization(code)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.CreateAuthWithDevice,
      async (_, data: AuthenticationByDeviceProperties) => {
        await Authentication.device(data)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.OpenEpicGamesSettings,
      async (_, account: AccountData) => {
        await Authentication.openEpicGamesSettings(account)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.GenerateExchangeCode,
      async (_, account: AccountData) => {
        await Authentication.generateExchangeCode(account)
      }
    )

    ipcMain.on(ElectronAPIEventKeys.RequestNewVersionStatus, async () => {
      await Application.checkVersion()
    })

    /**
     * Launcher
     */

    ipcMain.on(
      ElectronAPIEventKeys.LauncherStart,
      async (_, account: AccountData) => {
        await FortniteLauncher.start(account)
      }
    )

    /**
     * STW Operations
     */

    ipcMain.on(
      ElectronAPIEventKeys.SetSaveQuests,
      async (_, accounts: Array<AccountData>) => {
        await MCPClientQuestLogin.save(accounts)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.SetHombaseName,
      async (_, accounts: Array<AccountData>, homebaseName: string) => {
        await MCPHomebaseName.update(accounts, homebaseName)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.XPBoostsAccountProfileRequest,
      async (_, accounts: Array<AccountData>) => {
        await XPBoostsManager.requestAccounts(accounts)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.XPBoostsConsumePersonal,
      async (_, data: XPBoostsConsumePersonalData) => {
        await XPBoostsManager.consumePersonal(data)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.XPBoostsConsumeTeammate,
      async (_, data: XPBoostsConsumeTeammateData) => {
        await XPBoostsManager.consumeTeammate(data)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.XPBoostsSearchUser,
      async (_, config: XPBoostsSearchUserConfig) => {
        await XPBoostsManager.searchUser(
          ElectronAPIEventKeys.XPBoostsSearchUserNotification,
          config
        )
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.XPBoostsGeneralSearchUser,
      async (_, config: XPBoostsSearchUserConfig) => {
        await XPBoostsManager.generalSearchUser(config)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.UnlockRequest,
      async (_, accounts: Array<AccountData>) => {
        await Unlock.start(accounts)
      }
    )

    /**
     * Party
     */

    ipcMain.on(
      ElectronAPIEventKeys.PartyClaimAction,
      async (_, selectedAccount: Array<AccountData>) => {
        await ClaimRewards.start(selectedAccount)
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
          selectedAccount,
          accounts,
          claimState,
          {
            force: true,
          }
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
        await Party.leaveParty(selectedAccounts, accounts, claimState)
      }
    )

    ipcMain.on(ElectronAPIEventKeys.PartyLoadFriends, async () => {
      await Party.loadFriends()
    })

    ipcMain.on(
      ElectronAPIEventKeys.PartyAddNewFriendAction,
      async (_, account: AccountData, displayName: string) => {
        await Party.addNewFriend(account, displayName)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartyInviteAction,
      async (_, account: AccountData, accountIds: Array<string>) => {
        await Party.invite(account, accountIds)
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
        await Party.removeFriend(data)
      }
    )

    /**
     * Advanced Mode
     */

    ipcMain.on(
      ElectronAPIEventKeys.HomeFetchPlayerRequest,
      async (_, config: AlertsDoneSearchPlayerConfig) => {
        await AlertsDone.fetchPlayerData(config)
      }
    )

    ipcMain.on(ElectronAPIEventKeys.HomeWorldInfoRequest, async () => {
      await WorldInfoManager.requestForHome()
    })

    ipcMain.on(ElectronAPIEventKeys.WorldInfoRequestData, async () => {
      await WorldInfoManager.requestForAdvanceSection()
    })

    ipcMain.on(
      ElectronAPIEventKeys.WorldInfoSaveFile,
      async (_, data: SaveWorldInfoData) => {
        await WorldInfoManager.saveFile(data)
      }
    )

    ipcMain.on(ElectronAPIEventKeys.WorldInfoRequestFiles, async () => {
      await WorldInfoManager.requestFiles()
    })

    ipcMain.on(
      ElectronAPIEventKeys.WorldInfoDeleteFile,
      async (_, data: WorldInfoFileData) => {
        await WorldInfoManager.deleteFile(data)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.WorldInfoExportFile,
      async (_, data: WorldInfoFileData) => {
        await WorldInfoManager.exportWorldInfoFile(data)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.WorldInfoOpenFile,
      async (_, data: WorldInfoFileData) => {
        await WorldInfoManager.openWorldInfoFile(data)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.WorldInfoRenameFile,
      async (_, data: WorldInfoFileData, newFilename: string) => {
        await WorldInfoManager.renameFile(data, newFilename)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.MatchmakingTrackSaveFile,
      async (_, account: AccountData, accountId: string) => {
        await MatchmakingTrack.saveFile(account, accountId)
      }
    )

    /**
     * Automation
     */

    ipcMain.on(
      ElectronAPIEventKeys.AutomationServiceRequestData,
      async () => {
        await Automation.load()
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.AutomationServiceStart,
      async (_, accountId: string) => {
        await Automation.addAccount(accountId)
      }
    )

    // ipcMain.on(
    //   ElectronAPIEventKeys.AutomationServiceReload,
    //   async (_, accountId: string) => {
    //     await Automation.reload(accountId)
    //   }
    // )

    ipcMain.on(
      ElectronAPIEventKeys.AutomationServiceRemove,
      async (_, accountId: string) => {
        await Automation.removeAccount(accountId)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.AutomationServiceActionUpdate,
      async (
        _,
        accountId: string,
        config: AutomationServiceActionConfig
      ) => {
        await Automation.updateAction(accountId, config)
      }
    )

    /**
     * Urns
     */

    ipcMain.on(ElectronAPIEventKeys.UrnsServiceRequestData, async () => {
      await AutoPinUrns.load()
    })

    ipcMain.on(
      ElectronAPIEventKeys.UrnsServiceAdd,
      async (_, accountId: string) => {
        await AutoPinUrns.addAccount(accountId)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.UrnsServiceUpdate,
      async (
        _,
        accountId: string,
        type: 'mini-bosses' | 'urns',
        value: boolean
      ) => {
        await AutoPinUrns.updateAccount(accountId, type, value)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.UrnsServiceRemove,
      async (_, accountId: string) => {
        await AutoPinUrns.removeAccount(accountId)
      }
    )

    /**
     * Auto-llamas
     */

    ipcMain.on(
      ElectronAPIEventKeys.AutoLlamasLoadAccountsRequest,
      async () => {
        await AutoLlamas.load()

        Storefront.checkUpgradeFreeLlama().then((available) => {
          if (available) {
            ProcessAutoLlamas.start({
              selected: AutoLlamas.getAccounts({
                type: ProcessLlamaType.FreeUpgrade,
              }),
              type: ProcessLlamaType.FreeUpgrade,
            })
          }
        })

        ProcessAutoLlamas.start({
          selected: AutoLlamas.getAccounts({
            type: ProcessLlamaType.Survivor,
          }),
          type: ProcessLlamaType.Survivor,
        })
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.AutoLlamasAccountAdd,
      async (_, accounts: AutoLlamasAccountAddParams) => {
        await AutoLlamas.addAccount(accounts)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.AutoLlamasAccountUpdate,
      async (_, data: AutoLlamasAccountUpdateParams) => {
        await AutoLlamas.updateAccounts(data)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.AutoLlamasAccountRemove,
      async (_, data: Array<string> | null) => {
        await AutoLlamas.removeAccounts(data)
      }
    )

    ipcMain.on(ElectronAPIEventKeys.AutoLlamasAccountCheck, async () => {
      await AutoLlamas.check()
    })

    /**
     * V-Bucks Information
     */

    ipcMain.on(
      ElectronAPIEventKeys.VBucksInformationRequest,
      async (_, accounts: Array<AccountData>) => {
        await VBucksInformation.requestBulkInfo(accounts)
      }
    )

    /**
     * Redeem Codes
     */

    ipcMain.on(
      ElectronAPIEventKeys.RedeemCodesRedeem,
      async (_, accounts: Array<AccountData>, codes: Array<string>) => {
        await RedeemCodes.redeem(accounts, codes)
      }
    )

    /**
     * Accounts
     */

    ipcMain.on(
      ElectronAPIEventKeys.UpdateAccountBasicInfo,
      async (_, account: AccountBasicInfo) => {
        await AccountsManager.add(account)
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.ResponseUpdateAccountBasicInfo
        )
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.DevicesAuthRequestData,
      async (_, account: AccountData) => {
        await DevicesAuthManager.load(account)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.DevicesAuthRemove,
      async (_, account: AccountData, deviceId: string) => {
        await DevicesAuthManager.remove(account, deviceId)
      }
    )

    ipcMain.on(
      ElectronAPIEventKeys.EULAVerificationRequest,
      async (_, accountIds: Array<string>) => {
        await EULATracking.verify(accountIds)
      }
    )

    /**
     * Schedules
     */

    schedule.scheduleJob(
      {
        /**
         * Executes in every reset at time: 00:00:10 AM
         * Hour: 00
         * Minute: 00
         * Second: 10
         */
        rule: '10 0 0 * * *',
        /**
         * Time zone
         */
        tz: 'UTC',
      },
      () => {
        WorldInfoManager.requestForHome().catch(() => {})
        WorldInfoManager.requestForAdvanceSection().catch(() => {})
      }
    )

    schedule.scheduleJob(
      {
        /**
         * Runs: daily every hour
         * Hour: every hour
         * Minute: 1
         */
        rule: '1 * * * *',
        /**
         * Time zone
         */
        tz: 'UTC',
      },
      () => {
        Storefront.checkUpgradeFreeLlama().then((available) => {
          if (available) {
            ProcessAutoLlamas.start({
              selected: AutoLlamas.getAccounts({
                type: ProcessLlamaType.FreeUpgrade,
              }),
              type: ProcessLlamaType.FreeUpgrade,
            })
          }
        })
      }
    )

    schedule.scheduleJob(
      {
        /**
         * Runs: every reset at time: 00:01:00 AM
         * Hour: 0 AM (midnight)
         * Minute: 1
         */
        rule: '1 0 * * *',
        /**
         * Time zone
         */
        tz: 'UTC',
      },
      () => {
        ProcessAutoLlamas.start({
          selected: AutoLlamas.getAccounts({
            type: ProcessLlamaType.Survivor,
          }),
          type: ProcessLlamaType.Survivor,
        })
      }
    )
  })

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (!SystemTray.isActive) {
      MainWindow.closeApp()
    }
  })

  app.on('activate', async () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      MainWindow.setInstance(await createWindow())
    }
  })

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and import them here.
})()
