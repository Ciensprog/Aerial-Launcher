import type { PropsWithChildren } from 'react'

import { World } from '../../../config/constants/fortnite/world-info'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import {
  imgModifiers,
  imgResources,
  imgWorld,
} from '../../../lib/repository'
import { cn } from '../../../lib/utils'

export type MissionInformation = {
  id: string
  mission: {
    imageTypeUrl: string
    powerRating: number
  }
  modifiers: Array<{
    id: string
  }>
  rewards: {
    alert: Array<{
      id: string
      quantity: number
    }>
    base: Array<{
      id: string
      isBad?: boolean
      quantity: number
    }>
  }
  world: {
    id: World
    letter: string
    title?: string
  }
}

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
        '[&_.img-type]:flex-shrink-0 [&_.img-type]:size-5',
        '[&_.img-modifier]:flex-shrink-0 [&_.img-modifier]:size-5',
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
  data: MissionInformation
}>) {
  const { id, mission, modifiers, rewards, world } = data

  return (
    <AccordionItem
      className={cn('item', className)}
      value={id}
    >
      <AccordionTrigger className="trigger bg-muted-foreground/5 px-2 py-1 rounded hover:bg-muted-foreground/15 hover:no-underline">
        <span className="flex gap-1 items-center">
          <span
            className={cn(
              'border border-opacity-40 flex font-bold items-center justify-center relative rounded size-5 text-xs uppercase',
              {
                'border-stonewood text-stonewood':
                  world.id === World.Stonewood,
                'border-plankerton text-plankerton':
                  world.id === World.Plankerton,
                'border-canny-valley text-canny-valley':
                  world.id === World.CannyValley,
                'border-twine-peaks text-twine-peaks':
                  world.id === World.TwinePeaks,
              }
            )}
          >
            {world.letter}
          </span>
          <img
            src={imgWorld(`${mission.imageTypeUrl}.png`)}
            className="img-type"
            alt="Mission"
          />
          <span className="power">⚡{mission.powerRating}</span>
          {children}
        </span>
      </AccordionTrigger>

      <AccordionContent className="px-4 py-2">
        <div className="grid grid-cols-3 items-start my-2">
          {rewards.alert.length > 0 && (
            <section className="">
              <h2 className="">Alert Rewards:</h2>
              <div className="flex flex-col mt-1">
                {rewards.alert.map((alert) => (
                  <div
                    className="flex gap-1 items-center"
                    key={alert.id}
                  >
                    <img
                      src={imgWorld('alert.png')}
                      className="img-type"
                      alt="Alert"
                    />
                    <div className="flex gap-1 items-center">
                      <img
                        src={imgResources(`${alert.id}.png`)}
                        className="size-5"
                        alt="Resource"
                      />
                      {alert.quantity <= 1
                        ? ''
                        : numberWithCommaSeparator(alert.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="">
            <h2 className="">Base Rewards:</h2>
            <div className="flex flex-wrap gap-x-1 gap-y-1 mt-1">
              {rewards.base.map((reward) => (
                <div
                  className="flex gap-1 items-center"
                  key={reward.id}
                >
                  <img
                    src={imgResources(`${reward.id}.png`)}
                    className="size-5"
                    alt="Resource"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="">
            <h2 className="">Modifiers:</h2>
            <div className="flex flex-wrap gap-x-1 gap-y-1 mt-1">
              {modifiers.map((modifier) => (
                <div
                  className="flex gap-1 items-center"
                  key={modifier.id}
                >
                  <img
                    src={imgModifiers(`${modifier.id}.png`)}
                    className="size-5"
                    alt="Modifier"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
