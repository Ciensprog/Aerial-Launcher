export enum AutomationStatusType {
  LISTENING = 'listening',
  LOADING = 'loading',
  ISSUE = 'issue',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

export const missionIntervalRange = {
  min: 1,
  max: 5,
}
export const defaultMissionInterval = 3
