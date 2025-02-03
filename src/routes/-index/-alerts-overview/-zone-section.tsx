import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { useTranslation } from 'react-i18next'

import {
  World,
  worldNameByTheaterId,
} from '../../../config/constants/fortnite/world-info'

import { CommonMissionsSection } from '../-components/-common-missions-section'
import { EmptySection } from '../-components/-empty'
import { TitleSection } from '../-components/-title'
import { ZonePagination } from './-zone-pagination'

import { useZoneMissionsPagination } from './-hooks'

export function ZoneSection({
  deps,
  missions,
  theaterId,
}: {
  deps?: unknown
  missions: Collection<string, WorldInfoMission>
  theaterId: World
}) {
  const { t } = useTranslation(['alerts', 'zones'])

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
        <CommonMissionsSection
          missions={missions}
          currentPageTotalResults={pagination.active * perPage}
        />
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
