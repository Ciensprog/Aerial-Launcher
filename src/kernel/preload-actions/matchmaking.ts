import type { IpcRendererEvent } from 'electron'
import type { MatchmakingTrackPath } from '../../types/data/advanced-mode/matchmaking'
import type { AccountData } from '../../types/accounts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function requestMatchmakingPath() {
  ipcRenderer.send(ElectronAPIEventKeys.GetMatchmakingTrackPath)
}

export function saveMatchmakingFile(
  account: AccountData,
  accountId: string
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.MatchmakingTrackSaveFile,
    account,
    accountId
  )
}

export function notificationMatchmakingPath(
  callback: (value: MatchmakingTrackPath) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: MatchmakingTrackPath
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.GetMatchmakingTrackPathNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.GetMatchmakingTrackPathNotification,
        customCallback
      ),
  }
}

export function notificationMatchmakingSaveFile(
  callback: (value: boolean) => Promise<void>
) {
  const customCallback = (_: IpcRendererEvent, value: boolean) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.MatchmakingTrackSaveFileNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.MatchmakingTrackSaveFileNotification,
        customCallback
      ),
  }
}
