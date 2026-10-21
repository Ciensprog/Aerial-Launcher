import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'

import { useTranslation } from 'react-i18next'

import { RewardIcon } from '../../../components/reward-icon'
import { Button } from '../../../components/ui/button'

import {
  generatorsMatch,
  missionRewardsDiffer,
  missionTileKey,
} from '../../../lib/misje/swap-missions'
import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { cn } from '../../../lib/utils'

import {
  MissionItem,
  MissionRewardsPreview,
} from '../-components/-missions'

export function SwapMissionRow({
  theaterId,
  today,
  yesterday,
  selected,
  yesterdayLoaded,
  onToggle,
}: {
  theaterId: string
  today: WorldInfoMission
  yesterday: WorldInfoMission | undefined
  selected: boolean
  yesterdayLoaded: boolean
  onToggle: (key: string) => void
}) {
  const { t } = useTranslation(['alerts'])
  const key = missionTileKey(theaterId, today.raw.mission.tileIndex)
  const same = generatorsMatch(today, yesterday)
  const rewardsDiffer = missionRewardsDiffer(today, yesterday)
  const canSwap = Boolean(yesterday)
  const groupMismatch =
    Boolean(yesterday) &&
    today.ui.mission.zone.theme.isGroup !==
      yesterday?.ui.mission.zone.theme.isGroup

  return (
    <div
      className={cn('rounded', {
        'bg-[rgb(52_211_117_/_10%)]': selected,
      })}
    >
      <MissionItem
        data={today}
        hideCompletedCheck
        hideScreenshotButton
      >
        <MissionRewardsPreview mission={today} />
      </MissionItem>

      {yesterdayLoaded && (
        <div className="flex flex-wrap gap-2 items-center pb-2 pl-8 pr-2 text-sm">
          <span className="flex-shrink-0 text-muted-foreground">
            {t('swap.yesterday')}
          </span>

          {yesterday ? (
            <>
              <img
                src={yesterday.ui.mission.zone.type.imageUrl}
                className="img-type"
              />
              <span className="power">⚡{today.ui.powerLevel}</span>
              {yesterday.ui.mission.zone.theme.isGroup && (
                <span className="rounded border px-1 text-[0.65rem] uppercase text-muted-foreground">
                  4p
                </span>
              )}
              {yesterday.ui.mission.rewards
                .filter((reward) => !reward.itemId.includes('eventscaling'))
                .slice(0, 3)
                .map((reward) => (
                  <span
                    className="flex flex-shrink-0 items-center"
                    key={reward.itemId}
                  >
                    <RewardIcon
                      src={reward.imageUrl}
                      fallback={reward.fallbackUrl}
                      title={reward.name}
                      className="img-type"
                    />
                    {reward.quantity > 1 && (
                      <span className="ml-0.5 text-xs">
                        {numberWithCommaSeparator(reward.quantity)}x
                      </span>
                    )}
                  </span>
                ))}
              {same && (
                <span className="text-muted-foreground">
                  {t('swap.same-mission')}
                </span>
              )}
              {rewardsDiffer && (
                <span className="text-[0.7rem] text-emerald-500">
                  {t('swap.rewards-differ')}
                </span>
              )}
              <Button
                size="sm"
                variant={selected ? 'default' : 'secondary'}
                className="h-7"
                onClick={() => onToggle(key)}
                disabled={!canSwap}
              >
                {selected ? t('swap.selected') : t('swap.replace')}
              </Button>
              {groupMismatch && (
                <span className="text-[0.7rem] text-amber-500">
                  {t('swap.group-mismatch')}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">
              {t('swap.missing-yesterday')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
