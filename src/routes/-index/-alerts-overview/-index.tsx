import { Filter } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { ScrollArea } from '../../../components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  // SheetHeader,
  SheetTrigger,
} from '../../../components/ui/sheet'

import { EmptyResults } from '../-components/-empty'
import { MissionItem, MissionsContainer } from '../-components/-missions'

import { AlertFilters } from './-filters'

import { imgModifiers, imgResources } from '../../../lib/repository'

import { vbucksMissions } from '../-dummy-data'

export function AlertsOverview() {
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
          >
            <Filter className="mr-2 w-4" />
            Show Filters
          </Button>
        </SheetTrigger>
        <SheetContent
          className="p-0 py-2 w-[27rem] sm:max-w-full"
          hideCloseButton
        >
          <ScrollArea
            className="h-[calc(100vh-1rem)] px-3"
            id="alerts-overview-modal-content"
          >
            <AlertFilters />

            <div className="bg-background bottom-0 mt-5 pt-2 sticky">
              <SheetClose className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-md w-full">
                Back To Alerts
              </SheetClose>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <div className="mt-5 space-y-4">
        <section className="">
          <h2 className="font-bold mb-2 text-lg">V-Bucks Alerts</h2>
          <MissionsContainer>
            {vbucksMissions.map((data) => (
              <MissionItem
                data={data}
                key={data.id}
              >
                <>
                  <img
                    src={imgResources('currency_mtxswap.png')}
                    className="img-type"
                    alt="V-Bucks"
                  />
                  35 一
                  <span className="">
                    <img
                      src={imgModifiers('negative-mini-boss.png')}
                      className="img-modifier"
                      alt="Modifier"
                    />
                  </span>
                </>
              </MissionItem>
            ))}
          </MissionsContainer>
        </section>
      </div>

      <EmptyResults title="No alerts" />
    </>
  )
}
