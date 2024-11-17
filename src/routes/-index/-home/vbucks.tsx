import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'

import { EmptySection } from '../-components/-empty'
import {
  MissionItem,
  MissionsContainer,
  Modifiers,
} from '../-components/-missions'
import { TitleSection } from '../-components/-title'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'

export function VBucksSection({
  data,
}: {
  data: Collection<string, WorldInfoMission>
}) {
  return (
    <section aria-labelledby="title-vbucks">
      <TitleSection
        deps={data}
        id="title-vbucks"
      >
        V-Bucks
      </TitleSection>
      <EmptySection
        total={data.size}
        isVBucks
      >
        <MissionsContainer>
          {data.map((mission) => {
            const alert = mission.ui.alert.rewards.find((reward) =>
              reward.itemId.includes('currency_mtxswap')
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
                  {numberWithCommaSeparator(baseReward.quantity)}
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
