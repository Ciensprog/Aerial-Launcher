export type RewardsNotification = {
  accolades: {
    totalMissionXPRedeemed: number
    totalQuestXPRedeemed: number
  }
  accountId: string
  rewards: Record<string, number>
}
