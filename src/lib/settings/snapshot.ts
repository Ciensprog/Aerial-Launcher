import type { Settings } from '../../types/settings'

export function buildSettingsSnapshot(
  state: Settings,
  partial: Partial<Settings> = {},
): Settings {
  return {
    autoDailyQuests: partial.autoDailyQuests ?? state.autoDailyQuests,
    claimingRewards: partial.claimingRewards ?? state.claimingRewards,
    customProcess: partial.customProcess ?? state.customProcess,
    missionInterval: partial.missionInterval ?? state.missionInterval,
    path: partial.path ?? state.path,
    epicGamesDir: partial.epicGamesDir ?? state.epicGamesDir,
    epicGamesExtraDirs:
      partial.epicGamesExtraDirs ?? state.epicGamesExtraDirs ?? [],
    systemTray: partial.systemTray ?? state.systemTray,
    userAgent: partial.userAgent ?? state.userAgent,
    customProxyEnabled:
      partial.customProxyEnabled ?? state.customProxyEnabled,
    customProxyPort: partial.customProxyPort ?? state.customProxyPort,
  }
}
