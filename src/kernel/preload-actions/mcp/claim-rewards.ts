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
