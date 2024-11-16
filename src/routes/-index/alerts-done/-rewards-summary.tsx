import { EmptySection } from '../-components/-empty'
import {
  MissionItem,
  MissionsContainer,
  Modifiers,
} from '../-components/-missions'

import { useAlertsDoneData } from '../../../hooks/alerts/alerts-done'
import { usePlayerData } from './-hooks'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'

import { cn } from '../../../lib/utils'

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
        <EmptySection
          total={Object.entries(rewards).length}
          title="No available rewards"
        >
          <ul className="gap-2 grid grid-cols-4">
            {Object.entries(rewards).map(([itemId, item]) => (
              <li
                className="border flex items-center rounded"
                key={itemId}
              >
                <div className="bg-muted-foreground/10 flex flex-shrink-0 h-8 items-center justify-center w-9">
                  <img
                    src={item.imageUrl}
                    className="size-6"
                  />
                </div>
                <div className="flex-grow px-2 text-center text-sm truncate">
                  {numberWithCommaSeparator(item.quantity)}
                </div>
              </li>
            ))}
          </ul>
        </EmptySection>
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
          <MissionsContainer>
            {missions
              .entries()
              .toArray()
              .map(([missionId, mission]) => (
                <MissionItem
                  data={mission}
                  key={missionId}
                >
                  <>
                    {mission.ui.alert.rewards.length > 0 && (
                      <>
                        {mission.ui.alert.rewards
                          .map((reward) => {
                            if (
                              reward.itemId.includes('eventscaling') ||
                              reward.itemId.includes(
                                'campaign_event_currency'
                              ) ||
                              reward.itemId.includes('phoenixxp')
                            ) {
                              return null
                            }

                            return (
                              <span
                                className="flex items-center rounded"
                                key={reward.itemId}
                              >
                                <img
                                  src={reward.imageUrl}
                                  className="img-type"
                                />
                              </span>
                            )
                          })
                          .slice(0, 3)}{' '}
                        {mission.ui.mission.rewards.filter(
                          (reward) =>
                            !reward.itemId.includes('eventscaling') ||
                            reward.itemId.includes(
                              'campaign_event_currency'
                            ) ||
                            reward.itemId.includes('phoenixxp')
                        ).length > 0 && '•'}
                      </>
                    )}
                    {mission.ui.mission.rewards
                      .map((reward) => {
                        if (reward.itemId.includes('eventscaling')) {
                          return null
                        }

                        return (
                          <span
                            className={cn('flex items-center rounded', {
                              'gap mx-0.5 px-1 py-0.5 outline outline-[#ff6868]/50 outline-2':
                                reward.isBad,
                            })}
                            key={reward.itemId}
                          >
                            <img
                              src={reward.imageUrl}
                              className="img-type"
                            />
                            {reward.quantity <= 1 ? (
                              ''
                            ) : (
                              <span className="ml-0.5 text-sm">
                                {numberWithCommaSeparator(reward.quantity)}
                                x
                              </span>
                            )}
                            {reward.isBad && (
                              <span className="font-medium ml-1 px-1 rounded text-[#ff6868] text-[0.625rem] uppercase">
                                Mid
                              </span>
                            )}
                          </span>
                        )
                      })
                      .slice(0, 3)}
                    <Modifiers data={mission.ui.mission.modifiers} />
                  </>
                </MissionItem>
              ))}
          </MissionsContainer>
        </EmptySection>
      </section>
    </>
  )
}
