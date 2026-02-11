import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../../types/accounts'
import type {
  DailyQuestRerollResponse,
  DailyQuestsAccountData,
} from '../../../types/daily-quests'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

export function requestDailyQuests(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.DailyQuestsRequest, accounts)
}

export function rerollDailyQuest(account: AccountData, questId: string) {
  ipcRenderer.send(
    ElectronAPIEventKeys.DailyQuestReroll,
    account,
    questId
  )
}

export function notificationDailyQuests(
  callback: (value: Array<DailyQuestsAccountData>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<DailyQuestsAccountData>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.DailyQuestsNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.DailyQuestsNotification,
        customCallback
      ),
  }
}

export function notificationDailyQuestReroll(
  callback: (value: DailyQuestRerollResponse) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: DailyQuestRerollResponse
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.DailyQuestRerollNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.DailyQuestRerollNotification,
        customCallback
      ),
  }
}
