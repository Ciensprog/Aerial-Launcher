import { CommonMissionsSection } from '../-components/-common-missions-section'
import { EmptySection } from '../-components/-empty'
import { RewardsSummaryList } from '../-components/-rewards-summary-list'

import { useAlertsDoneData } from '../../../hooks/alerts/alerts-done'
import { usePlayerData } from './-hooks'

export function RewardsSummary() {
  const { playerData } = useAlertsDoneData()
  const { missions, rewards } = usePlayerData()

  if (!playerData?.data) {
    return null
  }

  const totalAlerts =
    playerData?.data?.profileChanges.profile.stats.attributes
      .mission_alert_redemption_record?.claimData?.length ?? 0

  return (
    <>
      <section
        className="mt-6"
        aria-labelledby="alerts-completed"
      >
        <div className="text-center">
          <h1
            className="font-medium text-xl"
            id="alerts-completed"
          >
            Alerts Completed
          </h1>
          <div className="font-bold text-4xl">{totalAlerts}</div>
        </div>
      </section>

      <section className="mt-3 space-y-2">
        <h1 className="font-medium text-xl">Summary</h1>
        <RewardsSummaryList rewards={rewards} />
      </section>

      <section className="mt-3 space-y-2">
        <h1 className="font-medium text-xl">Alerts</h1>
        <EmptySection
          total={missions.size}
          title={
            totalAlerts > 0 && missions.size <= 0
              ? "Found alerts do not match with any of today's missions"
              : undefined
          }
        >
          <CommonMissionsSection missions={missions} />
        </EmptySection>
      </section>
    </>
  )
}
