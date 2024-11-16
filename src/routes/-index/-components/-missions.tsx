import type { CSSProperties, PropsWithChildren } from 'react'
import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { imgWorld } from '../../../lib/repository'
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
        '[&_.img-type]:flex-shrink-0 [&_.img-type]:size-6',
        '[&_.img-modifier]:flex-shrink-0 [&_.img-modifier]:size-6',
        '[&_.img-alert]:flex-shrink-0 [&_.img-alert]:size-4',
        '[&_.power]:border [&_.power]:pl-0.5 [&_.power]:pr-2 [&_.power]:py-0.5 [&_.power]:rounded [&_.power]:text-xs',
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
      <AccordionTrigger className="trigger bg-muted-foreground/5 px-2 py-1 rounded hover:bg-muted-foreground/15 hover:no-underline">
        <span className="flex gap-1 items-center">
          {!mission.zone.iconUrl ? (
            <span
              className={cn(
                'border border-opacity-40 flex font-bold items-center justify-center relative rounded size-5 text-xs uppercase',
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
              Tile Index:
            </span>
            {data.raw.mission.tileIndex}
          </div>
          <div className="flex flex-col">
            <div className="inline-flex gap-1">
              <span className="flex-shrink-0 text-muted-foreground">
                Mission Alert Guid:
              </span>
              {alert.rewards.length > 0
                ? data.raw.alert?.missionAlertGuid ?? 'N/A'
                : 'N/A'}
            </div>
            <div className="inline-flex gap-1">
              <span className="flex-shrink-0 text-muted-foreground">
                Mission Guid:
              </span>
              {data.raw.mission.missionGuid ?? 'N/A'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 items-start my-2">
          {alert.rewards.length > 0 && (
            <section className="">
              <h2 className="">Alert Rewards:</h2>
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
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {mission.rewards.length > 0 && (
            <section className="">
              <h2 className="">Base Rewards:</h2>
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
            <section className="">
              <h2 className="">Modifiers:</h2>
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
      </AccordionContent>
    </AccordionItem>
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
        <span className="flex gap-0.5">
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
