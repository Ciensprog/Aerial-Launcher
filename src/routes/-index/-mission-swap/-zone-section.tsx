import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'
import type { SwapVbucksMission } from './-hooks'

import { Collection } from '@discordjs/collection'
import { useTranslation } from 'react-i18next'

import {
  World,
  worldNameByTheaterId,
} from '../../../config/constants/fortnite/world-info'

import { EmptySection } from '../-components/-empty'
import { MissionsContainer } from '../-components/-missions'
import { TitleSection } from '../-components/-title'

import { missionTileKey } from '../../../lib/misje/swap-missions'

import { SwapMissionRow } from './-row'

export function SwapVbucksSection({
  deps,
  items,
  yesterdayByTile,
  yesterdayLoaded,
  selected,
  onToggle,
}: {
  deps?: unknown
  items: Array<SwapVbucksMission>
  yesterdayByTile: Map<string, WorldInfoMission>
  yesterdayLoaded: boolean
  selected: Record<string, boolean>
  onToggle: (key: string) => void
}) {
  const { t } = useTranslation(['alerts'])

  if (items.length <= 0) {
    return null
  }

  return (
    <section aria-labelledby="swap-section-vbucks">
      <TitleSection
        deps={deps}
        id="swap-section-vbucks"
      >
        {t('sections.vbucks.title')}
        <span className="text-muted-foreground text-sm">
          (
          {t('information.missions', {
            total: items.length,
          })}
          )
        </span>
      </TitleSection>
      <EmptySection total={items.length}>
        <MissionsContainer>
          {items.map(({ theaterId, mission, missionId }) => {
            const key = missionTileKey(
              theaterId,
              mission.raw.mission.tileIndex,
            )

            return (
              <SwapMissionRow
                key={`${theaterId}-${missionId}`}
                theaterId={theaterId}
                today={mission}
                yesterday={yesterdayByTile.get(key)}
                selected={Boolean(selected[key])}
                yesterdayLoaded={yesterdayLoaded}
                onToggle={onToggle}
              />
            )
          })}
        </MissionsContainer>
      </EmptySection>
    </section>
  )
}

export function SwapZoneSection({
  deps,
  missions,
  theaterId,
  yesterdayByTile,
  yesterdayLoaded,
  selected,
  onToggle,
}: {
  deps?: unknown
  missions: Collection<string, WorldInfoMission>
  theaterId: World
  yesterdayByTile: Map<string, WorldInfoMission>
  yesterdayLoaded: boolean
  selected: Record<string, boolean>
  onToggle: (key: string) => void
}) {
  const { t } = useTranslation(['alerts', 'zones'])

  return (
    <section
      aria-labelledby={`swap-section-${theaterId}`}
      key={theaterId}
    >
      <TitleSection
        deps={deps}
        id={`swap-section-${theaterId}`}
      >
        {worldNameByTheaterId[
          theaterId as keyof typeof worldNameByTheaterId
        ]
          ? t(theaterId, {
              ns: 'zones',
            })
          : t('ventures', {
              ns: 'zones',
            })}
        <span className="text-muted-foreground text-sm">
          (
          {t('information.missions', {
            total: missions.size,
          })}
          )
        </span>
      </TitleSection>
      <EmptySection total={missions.size}>
        <MissionsContainer>
          {Array.from(missions.entries()).map(([missionId, mission]) => {
              const key = missionTileKey(
                theaterId,
                mission.raw.mission.tileIndex,
              )

              return (
                <SwapMissionRow
                  key={missionId}
                  theaterId={theaterId}
                  today={mission}
                  yesterday={yesterdayByTile.get(key)}
                  selected={Boolean(selected[key])}
                  yesterdayLoaded={yesterdayLoaded}
                  onToggle={onToggle}
                />
              )
            })}
        </MissionsContainer>
      </EmptySection>
    </section>
  )
}
