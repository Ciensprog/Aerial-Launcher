import type { AccountData } from '../types/accounts'
import type { AuthenticationByDeviceProperties } from '../types/authentication'

import path from 'node:path'
import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron'
import schedule from 'node-schedule'
// import { updateElectronApp } from 'update-electron-app'

import { ElectronAPIEventKeys } from '../config/constants/main-process'

import { AntiCheatProvider } from './core/anti-cheat-provider'
import { Authentication } from './core/authentication'
import { FortniteLauncher } from './core/launcher'
import { AccountsManager } from './startup/accounts'
import { DataDirectory } from './startup/data-directory'

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
// updateElectronApp()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  await DataDirectory.createDataFiles()

  const currentWindow = await createWindow()

  /**
   * General Methods
   */

  ipcMain.on(ElectronAPIEventKeys.OpenExternalURL, (_, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.on(ElectronAPIEventKeys.RequestAccounts, async () => {
    await AccountsManager.load(currentWindow)
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

  ipcMain.on(
    ElectronAPIEventKeys.RequestProviderAndAccessTokenOnStartup,
    async (_, account: AccountData) => {
      const response = await AntiCheatProvider.request(account)

      currentWindow.webContents.send(
        ElectronAPIEventKeys.ResponseProviderAndAccessTokenOnStartup,
        response
      )
    }
  )

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
      currentWindow.webContents.send(
        ElectronAPIEventKeys.ScheduleRequestAccounts
      )
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
