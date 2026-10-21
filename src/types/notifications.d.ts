export type RewardsNotification = {
  accolades: {
    totalMissionXPRedeemed: number
    totalQuestXPRedeemed: number
  }
  accountId: string
  createdAt: string
  id: string
  rewards: Record<string, number>
  /** Highest claimed endurance reward wave per zone. */
  endurance?: Array<{
    zone: string
    wave: number
  }>
}
