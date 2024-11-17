import { Menu, nativeImage, Tray } from 'electron'

import packageJson from '../../../package.json'
import { MainWindow } from './windows/main'

export class SystemTray {
  private static current: Tray | null = null
  private static active = false

  static get isActive() {
    return SystemTray.active
  }

  static setIsActive(value: boolean) {
    SystemTray.active = value
  }

  static async create({ onOpen }: { onOpen: () => Promise<void> }) {
    if (SystemTray.current !== null) {
      return
    }

    try {
      const responseFetch = await fetch(
        `https://raw.githubusercontent.com/${packageJson.author.name}/Aerial-Launcher/main/icon-transparent.png`
      )
      const responseBlob = await responseFetch.blob()
      const arrayBuffer = await responseBlob.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const icon = nativeImage.createFromBuffer(buffer)

      SystemTray.current = new Tray(icon)

      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Open Aerial Launcher',
          type: 'normal',
          click: () => {
            onOpen()
          },
        },
        {
          label: 'Exit',
          type: 'normal',
          click: () => {
            MainWindow.closeApp()
          },
        },
      ])

      SystemTray.current.setContextMenu(contextMenu)
      SystemTray.current.setToolTip('This is my application')
      SystemTray.current.setTitle('This is my title')

      SystemTray.current.addListener('click', () => {
        onOpen()
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }
  }

  static destroy() {
    SystemTray.current?.removeAllListeners()
    SystemTray.current?.destroy()
    SystemTray.current = null
  }
}
