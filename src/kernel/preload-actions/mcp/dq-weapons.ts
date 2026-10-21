import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../../types/accounts'
import type {
  DqWeaponsAccountData,
  DqWeaponsFavoriteAccountResult,
} from '../../../types/dq-weapons'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

export function requestDqWeapons(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.DqWeaponsRequest, accounts)
}

export function requestDqWeaponsFavorite(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.DqWeaponsFavoriteRequest, accounts)
}

export function notificationDqWeapons(
  callback: (value: Array<DqWeaponsAccountData>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<DqWeaponsAccountData>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.DqWeaponsNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.DqWeaponsNotification,
        customCallback
      ),
  }
}

export function notificationDqWeaponsFavorite(
  callback: (value: Array<DqWeaponsFavoriteAccountResult>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<DqWeaponsFavoriteAccountResult>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.DqWeaponsFavoriteNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.DqWeaponsFavoriteNotification,
        customCallback
      ),
  }
}
