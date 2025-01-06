import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { useTranslation } from 'react-i18next'

import { EmptySection } from '../-components/-empty'
import {
  MissionItem,
  MissionsContainer,
  Modifiers,
} from '../-components/-missions'
import { TitleSection } from '../-components/-title'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { isLegendaryOrMythicSurvivor } from '../../../lib/validations/resources'

export function SurvivorsSection({
  data,
}: {
  data: Collection<string, WorldInfoMission>
}) {
  const { t } = useTranslation(['alerts'])

  return (
    <section aria-labelledby="title-survivors">
      <TitleSection
        deps={data}
        id="title-survivors"
      >
        {t('sections.survivors.title')}
      </TitleSection>
      <EmptySection
        total={data.size}
        title={t('sections.survivors.empty')}
      >
        <MissionsContainer>
          {data.map((mission) => {
            const alert = mission.ui.alert.rewards.find((reward) =>
              isLegendaryOrMythicSurvivor(reward.itemId)
            )
            const reward = mission.ui.mission.rewards.find((reward) =>
              reward.itemId.includes('alteration_upgrade_uc')
            )
            const baseReward = alert ?? reward

            if (!baseReward) {
              return null
            }

            return (
              <MissionItem
                data={mission}
                key={mission.raw.mission.missionGuid}
              >
                <>
                  <img
                    src={baseReward.imageUrl}
                    className="img-type"
                  />
                  {baseReward.quantity > 1
                    ? numberWithCommaSeparator(baseReward.quantity)
                    : null}
                  <Modifiers data={mission.ui.mission.modifiers} />
                </>
              </MissionItem>
            )
          })}
        </MissionsContainer>
      </EmptySection>
    </section>
  )
}
