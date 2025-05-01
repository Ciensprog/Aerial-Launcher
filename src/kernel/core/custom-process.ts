import { node_process_watcher } from 'node-process-watcher'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'

export class CustomProcess {
  private static id: number | null = null
  private static name: string | null = null
  private static isRunning = false

  static init() {
    if (!CustomProcess.name) {
      return
    }

    node_process_watcher.on('custom-process', (list) => {
      const filtered = list.find(
        (item) => item.name === CustomProcess.name
      )
      const isRunning = filtered !== undefined

      if (filtered?.id !== undefined) {
        CustomProcess.id = filtered.id
      }

      CustomProcess.isRunning = isRunning

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.CustomProcessStatus,
        CustomProcess.isRunning
      )
    })
  }

  static kill() {
    if (typeof CustomProcess.id !== 'number') {
      return
    }

    node_process_watcher.kill_process(CustomProcess.id, true)
  }

  static setName(value: string, restart?: boolean) {
    if (value === CustomProcess.name) {
      return
    }

    CustomProcess.name = value

    if (restart) {
      CustomProcess.destroy()
      CustomProcess.init()
    }
  }

  static destroy() {
    CustomProcess.id = null
    CustomProcess.name = null
    CustomProcess.isRunning = false
    node_process_watcher.close('custom-process')
  }
}
