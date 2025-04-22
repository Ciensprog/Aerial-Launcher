import type { CSSProperties, PropsWithChildren } from 'react'
import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'

import { useTranslation } from 'react-i18next'

import { rarities } from '../../../config/constants/resources'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { imgRarities, imgWorld } from '../../../lib/repository'
import { cn } from '../../../lib/utils'

export function MissionsContainer({
  children,
  className,
}: PropsWithChildren<{
  className?: string
}>) {
  return (
    <Accordion
      className={cn(
        'gap-0.5 grid grid-cols-1',
        '[&_.item]:border-b-0',
        '[&_.img-rarity]:flex-shrink-0 [&_.img-rarity:not(.img-small)]:size-4 [&_.img-rarity]:size-3',
        '[&_.img-type]:flex-shrink-0 [&_.img-type]:size-6',
        '[&_.img-modifier]:flex-shrink-0 [&_.img-modifier]:size-6',
        '[&_.img-alert]:flex-shrink-0 [&_.img-alert]:size-4',
        '[&_.power]:border [&_.power]:flex-shrink-0 [&_.power]:pl-0.5 [&_.power]:pr-2 [&_.power]:py-1 [&_.power]:rounded [&_.power]:text-xs',
        className
      )}
      type="multiple"
    >
      {children}
    </Accordion>
  )
}

export function MissionItem({
  data,
  children,
  className,
}: PropsWithChildren<{
  className?: string
  data: WorldInfoMission
}>) {
  const { t } = useTranslation(['alerts'], {
    keyPrefix: 'information',
  })

  const {
    raw: {
      mission: { missionGuid },
    },
    ui: { alert, mission, powerLevel },
  } = data

  return (
    <AccordionItem
      className={cn('item', className)}
      value={missionGuid}
    >
      <AccordionTrigger className="trigger bg-muted-foreground/5 px-2 py-0 rounded hover:bg-muted-foreground/15 hover:no-underline">
        <span className="flex gap-1 items-center max-w-[29.375rem] overflow-hidden py-0.5">
          {!mission.zone.iconUrl ? (
            <span
              className={cn(
                'border border-opacity-40 flex flex-shrink-0 font-bold items-center justify-center relative rounded size-5 text-xs uppercase',
                'border-[color:var(--zone-color)] text-[color:var(--zone-color)]'
              )}
              style={
                {
                  '--zone-color': mission.zone.color,
                } as CSSProperties
              }
            >
              {mission.zone.letter}
            </span>
          ) : (
            <img
              src={mission.zone.iconUrl}
              className="img-type"
            />
          )}
          <img
            src={mission.zone.type.imageUrl}
            className="img-type"
          />
          <span className="power">⚡{powerLevel}</span>
          {children}
        </span>
      </AccordionTrigger>

      <AccordionContent className="px-4 py-2">
        <div className="border-l-8 border-l-muted-foreground/10 pl-2 text-sm">
          <div className="inline-flex gap-1">
            <span className="flex-shrink-0 text-muted-foreground">
              {t('tile-index')}
            </span>
            {data.raw.mission.tileIndex}
          </div>
          <div className="flex flex-col">
            <div className="inline-flex gap-1">
              <span className="flex-shrink-0 text-muted-foreground">
                {t('alert-guid')}
              </span>
              {alert.rewards.length > 0
                ? data.raw.alert?.missionAlertGuid ?? 'N/A'
                : 'N/A'}
            </div>
            <div className="inline-flex gap-1">
              <span className="flex-shrink-0 text-muted-foreground">
                {t('mission-guid')}
              </span>
              {data.raw.mission.missionGuid ?? 'N/A'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 items-start my-2">
          {alert.rewards.length > 0 && (
            <section>
              <h2>{t('alert-rewards')}</h2>
              <div className="flex flex-col mt-1">
                {alert.rewards.map((reward) => (
                  <div
                    className="flex gap-1 items-center"
                    key={reward.itemId}
                  >
                    <img
                      src={imgWorld('alert.png')}
                      className="img-alert"
                    />
                    <div className="flex gap-1 items-center">
                      <img
                        src={reward.imageUrl}
                        className="img-type"
                      />
                      {reward.quantity <= 1
                        ? ''
                        : numberWithCommaSeparator(reward.quantity)}
                      <SchematicRarity reward={reward} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="gap-2 grid grid-cols-1">
            {mission.rewards.length > 0 && (
              <section>
                <h2>{t('base-rewards')}</h2>
                <div className="flex flex-wrap gap-x-1 gap-y-1 mt-1">
                  {mission.rewards.map((reward) => (
                    <div
                      className="flex gap-1 items-center"
                      key={reward.itemId}
                    >
                      <img
                        src={reward.imageUrl}
                        className="img-type"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {mission.modifiers.length > 0 && (
              <section>
                <h2>{t('modifiers')}</h2>
                <div className="flex flex-wrap gap-x-1 gap-y-1 mt-1">
                  {mission.modifiers.map((modifier) => (
                    <div
                      className="flex gap-1 items-center"
                      key={modifier.id}
                    >
                      <img
                        src={modifier.imageUrl}
                        className="img-modifier"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function SchematicRarity({
  preview,
  reward,
}: {
  preview?: boolean
  reward: WorldInfoMission['ui']['alert']['rewards'][number]
}) {
  return (
    reward.type === 'trap' &&
    rarities[reward.rarity] && (
      <span className="flex flex-shrink-0 items-center text-center text-muted-foreground">
        {!preview && '('}
        <img
          src={imgRarities(`${reward.rarity}.png`)}
          className={cn('img-rarity', {
            'img-small': preview,
          })}
        />
        {!preview && ')'}
      </span>
    )
  )
}

export function Modifiers({
  data,
}: {
  data: WorldInfoMission['ui']['mission']['modifiers']
}) {
  return (
    data.length > 0 && (
      <>
        {' '}
        •
        <span className="flex flex-shrink-0 gap-0.5">
          {data.slice(0, 5).map((modifier) => (
            <img
              src={modifier.imageUrl}
              className="img-modifier"
              key={modifier.id}
            />
          ))}
        </span>
      </>
    )
  )
}
