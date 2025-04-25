import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { useTranslation } from 'react-i18next'

import { EmptySection } from '../-components/-empty'
import {
  MissionItem,
  MissionsContainer,
  Modifiers,
  SchematicRarity,
} from '../-components/-missions'
import { TitleSection } from '../-components/-title'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { cn } from '../../../lib/utils'

export function EndgameVenturesSection({
  data,
}: {
  data: Collection<string, WorldInfoMission>
}) {
  const { t } = useTranslation(['alerts'])

  return (
    <section aria-labelledby="title-endgame-ventures">
      <TitleSection
        deps={data}
        id="title-endgame-ventures"
      >
        {t('sections.ventures.title-endgame')}
      </TitleSection>
      <EmptySection total={data.size}>
        <MissionsContainer>
          {data.map((mission) => (
            <MissionItem
              data={mission}
              key={mission.raw.mission.missionGuid}
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
                            className={cn(
                              'flex flex-shrink-0 items-center rounded',
                              {
                                'border px-1': reward.type === 'trap',
                              }
                            )}
                            key={reward.itemId}
                          >
                            <img
                              src={reward.imageUrl}
                              className="img-type"
                            />
                            <SchematicRarity
                              reward={reward}
                              preview
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
                    if (
                      reward.itemId.includes('eventscaling') ||
                      reward.itemId.includes('phoenixxp')
                    ) {
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
  )
}
