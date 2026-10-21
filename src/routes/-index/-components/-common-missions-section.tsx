import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'

import {
  MissionItem,
  MissionRewardsPreview,
  MissionsContainer,
} from '../-components/-missions'

export function CommonMissionsSection({
  currentPageTotalResults,
  hideCompletedCheck,
  missions,
}: {
  currentPageTotalResults?: number
  hideCompletedCheck?: boolean
  missions: Collection<string, WorldInfoMission>
}) {

  const currentMissions =
    currentPageTotalResults !== undefined
      ? missions.entries().toArray().slice(0, currentPageTotalResults)
      : missions.entries().toArray()

  return (
    <MissionsContainer>
      {currentMissions.map(([missionId, mission]) => (
        <MissionItem
          data={mission}
          key={missionId}
          hideCompletedCheck={hideCompletedCheck}
        >
          <MissionRewardsPreview mission={mission} />
        </MissionItem>
      ))}
    </MissionsContainer>
  )
}
