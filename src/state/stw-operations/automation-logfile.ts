import type { AutomationLogFileStatus } from '../../types/automation'

import { create } from 'zustand'

export type AutomationLogFileState = AutomationLogFileStatus & {
  setStatus: (status: AutomationLogFileStatus) => void
}

export const useAutomationLogFileStore = create<AutomationLogFileState>()(
  (set) => ({
    logPath: '',
    kick: false,
    claim: false,
    claimParty: false,
    transferMats: false,
    fortniteRunning: false,
    instanceCount: 0,
    players: [],
    lastEvent: null,
    stamp: 0,
    setStatus: (status) => set(status),
  }),
)
