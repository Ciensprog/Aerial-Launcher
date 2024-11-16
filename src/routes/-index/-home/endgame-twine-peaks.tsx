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
import { cn } from '../../../lib/utils'

export function EndgameTwinePeaksSection({
  data,
}: {
  data: Collection<string, WorldInfoMission>
}) {
  return (
    <section aria-labelledby="title-endgame-twine-peaks">
      <TitleSection
        deps={data}
        id="title-endgame-twine-peaks"
      >
        Twine Peaks ⚡160
      </TitleSection>
      <EmptySection total={data.size}>
        <MissionsContainer>
          {data.map((mission) => (
            <MissionItem
              data={mission}
              key={mission.raw.mission.missionGuid}
            >
              <>
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
      </EmptySection>
    </section>
  )
}
