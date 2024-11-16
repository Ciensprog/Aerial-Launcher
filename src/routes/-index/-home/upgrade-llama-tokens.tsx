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

export function UpgradeLlamaTokensSection({
  data,
}: {
  data: Collection<string, WorldInfoMission>
}) {
  return (
    <section aria-labelledby="title-upgrade-llama-tokens">
      <TitleSection
        deps={data}
        id="title-upgrade-llama-tokens"
      >
        Upgrade Llama Tokens
      </TitleSection>
      <EmptySection total={data.size}>
        <MissionsContainer>
          {data.map((mission) => {
            const alert = mission.ui.alert.rewards.find((reward) =>
              reward.itemId.includes('voucher_cardpack_bronze')
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
