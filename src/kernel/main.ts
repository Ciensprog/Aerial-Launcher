import path from 'node:path'
import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron'
// import { updateElectronApp } from 'update-electron-app'

import { electronAPIEventKeys } from '../config/constants/main-process'

import { AccountsManager } from './startup/accounts'
import { DataDirectory } from './startup/data-directory'
import { Authentication } from './core/authentication'

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

  ipcMain.on(electronAPIEventKeys.openExternalURL, (_, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.on(electronAPIEventKeys.requestAccounts, async () => {
    await AccountsManager.load(currentWindow)
  })

  ipcMain.on(
    electronAPIEventKeys.onRemoveAccount,
    async (_, accountId: string) => {
      await AccountsManager.remove(accountId)
    }
  )

  ipcMain.on(
    electronAPIEventKeys.createAuthWithExchange,
    async (_, code: string) => {
      await Authentication.exchange(currentWindow, code)
    }
  )

  ipcMain.on(
    electronAPIEventKeys.createAuthWithAuthorization,
    async (_, code: string) => {
      await Authentication.authorization(currentWindow, code)
    }
  )

  ipcMain.on(
    electronAPIEventKeys.createAuthWithDevice,
    async (
      _,
      data: {
        accountId: string
        deviceId: string
        secret: string
      }
    ) => {
      await Authentication.device(currentWindow, data)
    }
  )
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
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
