import { BrowserWindow } from 'electron'

export class MainWindow {
  private static value: BrowserWindow

  static get instance() {
    return MainWindow.value
  }

  static setInstance(value: BrowserWindow) {
    MainWindow.value = value
  }
}
