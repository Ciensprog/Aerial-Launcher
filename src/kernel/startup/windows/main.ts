import { app, BrowserWindow } from 'electron'
import schedule from 'node-schedule'

import { Automation } from '../automation'

export class MainWindow {
  private static value: BrowserWindow

  static get instance() {
    return MainWindow.value
  }

  static setInstance(value: BrowserWindow) {
    if (!MainWindow.value) {
      MainWindow.value = value
    }
  }

  static cleanup() {
    MainWindow.instance.removeAllListeners()

    Automation.getProcesses().forEach((accountProcess) => {
      accountProcess.clearMissionIntervalId()
    })
    Automation.getServices().forEach((accountService) => {
      accountService.destroy()
    })
    schedule.gracefulShutdown().catch(() => {})
  }

  static closeApp() {
    if (process.platform !== 'darwin') {
      MainWindow.cleanup()
      app.quit()
    }
  }
}
