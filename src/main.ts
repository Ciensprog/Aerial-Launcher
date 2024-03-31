import path from 'node:path'
import { app, BrowserWindow, Menu } from 'electron'
// import { updateElectronApp } from 'update-electron-app'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

function createWindow() {
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
      spellcheck: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({
      mode: 'undocked',
    })
  }

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(
      path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
      )
    )
  }
}

Menu.setApplicationMenu(null)
// updateElectronApp()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

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
