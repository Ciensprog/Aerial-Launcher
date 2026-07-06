export type EpicGameEntry = {
  id: string
  displayName: string
  appName: string
  workingDir: string
  launchExe: string
  exchangeLaunch: boolean
  icon?: string
}

export type GamesLauncherStartPayload = {
  account: import('./accounts').AccountData
  game: EpicGameEntry
}

export type GamesLauncherNotificationPayload = {
  account: import('./accounts').AccountData
  game: EpicGameEntry
  status: boolean
}