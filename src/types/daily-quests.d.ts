export type DailyQuestProgress = {
  key: string
  label: string
  value: number
}

export type DailyQuest = {
  questId: string
  templateId: string
  name: string
  state: string
  progress: Array<DailyQuestProgress>
}

export type DailyQuestsAccountData = {
  accountId: string
  available: boolean
  rerolls: number
  quests: Array<DailyQuest>
  errorMessage?: string
}

export type DailyQuestRerollResponse =
  | {
      accountId: string
      success: false
      errorMessage: string
      data?: DailyQuestsAccountData
    }
  | {
      accountId: string
      success: true
      errorMessage: null
      data: DailyQuestsAccountData
    }
