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

export function UncommonPerkUpSection({
  data,
}: {
  data: Collection<string, WorldInfoMission>
}) {
  const { t } = useTranslation(['alerts'])

  return (
    <section aria-labelledby="title-uncommon-perks">
      <TitleSection
        deps={data}
        id="title-uncommon-perks"
      >
        {t('sections.uc-perk.title')}
        <span className="text-muted-foreground text-sm">
          (
          {t('information.missions', {
            total: data.size,
          })}
          )
        </span>
      </TitleSection>
      <EmptySection total={data.size}>
        <MissionsContainer>
          {data.map((mission) => {
            const alert = mission.ui.alert.rewards.find((reward) =>
              reward.itemId.includes('alteration_upgrade_uc')
            )
            const reward = mission.ui.mission.rewards.find((reward) =>
              reward.itemId.includes('alteration_upgrade_uc')
            )
            const baseReward = alert ?? reward

            if (!baseReward) {
              return null
            }

            const quantity =
              baseReward.quantity > 1
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (baseReward as any).isBad !== undefined
                  ? `${numberWithCommaSeparator(baseReward.quantity)}x`
                  : numberWithCommaSeparator(baseReward.quantity)
                : null

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
                  {quantity}
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
