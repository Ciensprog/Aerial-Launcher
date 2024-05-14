import type { AccountData } from '../../../types/accounts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

export function setClientQuestLogin(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.SetSaveQuests, accounts)
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
