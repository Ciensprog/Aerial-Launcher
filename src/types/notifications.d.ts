export type RewardsNotification = {
  accolades: {
    totalMissionXPRedeemed: number
    totalQuestXPRedeemed: number
  }
  accountId: string
  createdAt: string
  id: string
  rewards: Record<string, number>
}
