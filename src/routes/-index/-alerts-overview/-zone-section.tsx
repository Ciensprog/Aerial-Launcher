import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'

import {
  World,
  worldNameByTheaterId,
} from '../../../config/constants/fortnite/world-info'

import { EmptySection } from '../-components/-empty'
import {
  MissionItem,
  MissionsContainer,
  Modifiers,
} from '../-components/-missions'
import { TitleSection } from '../-components/-title'
import { ZonePagination } from './-zone-pagination'

import { useZoneMissionsPagination } from './-hooks'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { cn } from '../../../lib/utils'

export function ZoneSection({
  deps,
  missions,
  theaterId,
}: {
  deps?: unknown
  missions: Collection<string, WorldInfoMission>
  theaterId: World
}) {
  const { pagination, perPage, totalPages } = useZoneMissionsPagination({
    id: theaterId,
    total: missions.size,
  })

  return (
    <section
      aria-labelledby={`section-${theaterId}`}
      key={theaterId}
    >
      <TitleSection
        deps={deps}
        id={`section-${theaterId}`}
      >
        {worldNameByTheaterId[
          theaterId as keyof typeof worldNameByTheaterId
        ] ?? 'Ventures'}
        <span className="text-muted-foreground text-sm">
          ({missions.size} mission
          {missions.size === 1 ? '' : 's'})
        </span>
      </TitleSection>
      <EmptySection total={missions.size}>
        <MissionsContainer>
          {missions
            .entries()
            .toArray()
            .slice(0, pagination.active * perPage)
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
                              {numberWithCommaSeparator(reward.quantity)}x
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
        {missions.size > 10 && (
          <ZonePagination
            pagination={pagination}
            perPage={perPage}
            totalMissions={missions.size}
            totalPages={totalPages}
          />
        )}
      </EmptySection>
    </section>
  )
}
