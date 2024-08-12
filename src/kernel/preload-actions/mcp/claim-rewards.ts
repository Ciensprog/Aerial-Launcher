import type { IpcRendererEvent } from 'electron'
import type { RewardsNotification } from '../../../types/notifications'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

export function notificationClaimedRewards(
  callback: (value: Array<RewardsNotification>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<RewardsNotification>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.ClaimRewardsClientNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.ClaimRewardsClientNotification,
        customCallback
      ),
  }
}

export function notificationGlobalSyncClaimedRewards(
  callback: (value: Array<RewardsNotification>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<RewardsNotification>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.ClaimRewardsClientGlobalSyncNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.ClaimRewardsClientGlobalSyncNotification,
        customCallback
      ),
  }
}

export function notificationGlobalClaimedRewards(
  callback: () => Promise<void>
) {
  const customCallback = () => {
    callback().catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.ClaimRewardsClientGlobalAutoClaimedNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.ClaimRewardsClientGlobalAutoClaimedNotification,
        customCallback
      ),
  }
}

export function notificationAutoKick(
  callback: (total: number) => Promise<void>
) {
  const customCallback = (_: IpcRendererEvent, total: number) => {
    callback(total).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyKickActionGlobalNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyKickActionGlobalNotification,
        customCallback
      ),
  }
}
