import { useTranslation } from 'react-i18next'

import { CommonMissionsSection } from '../-components/-common-missions-section'
import { EmptySection } from '../-components/-empty'
import { RewardsSummaryList } from '../-components/-rewards-summary-list'

import { useAlertsDoneData } from '../../../hooks/alerts/alerts-done'
import { usePlayerData } from './-hooks'

export function RewardsSummary() {
  const { t } = useTranslation(['alerts', 'general'])

  const { playerData } = useAlertsDoneData()
  const { missions, rewards } = usePlayerData()

  if (!playerData?.data) {
    return null
  }

  const totalAlerts =
    playerData?.data?.profileChanges?.profile.stats.attributes
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
            {t('information.alerts-completed')}
          </h1>
          <div className="font-bold text-4xl">{totalAlerts}</div>
        </div>
      </section>

      <section className="mt-3 space-y-2">
        <h1 className="font-medium text-xl">
          {t('information.rewards-summary')}
        </h1>
        <RewardsSummaryList rewards={rewards} />
      </section>

      <section className="mt-3 space-y-2">
        <h1 className="flex font-medium gap-2 items-center text-xl">
          {t('missions', {
            ns: 'general',
          })}
          <span className="text-muted-foreground text-xs">
            (
            {t('sort.newest', {
              ns: 'general',
            })}
            )
          </span>
        </h1>
        <EmptySection
          total={missions.size}
          title={
            totalAlerts > 0 && missions.size <= 0
              ? t('results.empty.alerts-done')
              : undefined
          }
        >
          <CommonMissionsSection
            missions={missions}
            hideCompletedCheck
          />
        </EmptySection>
      </section>
    </>
  )
}
