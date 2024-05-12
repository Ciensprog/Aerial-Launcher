import type { AccountData } from '../../../types/accounts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

export function setClientQuestLogin(account: AccountData) {
  ipcRenderer.send(ElectronAPIEventKeys.SetSaveQuests, account)
}

export function notificationClientQuestLogin(
  callback: () => Promise<void>
) {
  const customCallback = () => {
    callback().catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.SaveQuestsNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.SaveQuestsNotification,
        customCallback
      ),
  }
}
