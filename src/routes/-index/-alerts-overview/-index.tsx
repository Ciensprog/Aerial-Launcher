import { Filter, X } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { ScrollArea } from '../../../components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '../../../components/ui/sheet'

import { EmptyResults, EmptySection } from '../-components/-empty'
import { LoadingMissions } from '../-components/-loading'
import { AlertFilters } from './-filters'

import { useAlertsOverviewData } from './-hooks'

import { ResetFiltersButton } from './-reset-filters-button'
import { ZoneSection } from './-zone-section'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { cn } from '../../../lib/utils'
import { TitleSection } from '../-components/-title'

export function AlertsOverview() {
  const {
    $inputSearch,
    data,
    inputSearch,
    loading,
    alertRewards,
    clearInputSearch,
    onChangeInputSearch,
  } = useAlertsOverviewData()

  return (
    <>
      <div className="flex gap-4 items-center">
        <div className="flex flex-grow items-center relative">
          <Input
            className={cn('h-9', {
              'pr-9': inputSearch.length > 0,
            })}
            placeholder="Search: mission/alert guid, tileIndex or reward ID"
            value={inputSearch}
            onChange={onChangeInputSearch}
            disabled={loading.isFetching || loading.isReloading}
            ref={$inputSearch}
          />
          {inputSearch.length > 0 && (
            <Button
              className="absolute right-1 rounded size-7"
              size="icon"
              variant="ghost"
              onClick={clearInputSearch}
            >
              <X className="size-4" />
              <span className="sr-only">clear input search</span>
            </Button>
          )}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="flex-shrink-0"
              variant="secondary"
              size="sm"
              disabled={loading.isFetching || loading.isReloading}
            >
              <Filter className="mr-2 w-4" />
              Show Filters
            </Button>
          </SheetTrigger>
          <SheetContent
            className="p-0 pt-2 w-[27rem] sm:max-w-full"
            hideCloseButton
          >
            <ScrollArea
              className="h-[calc(100vh-0.5rem)]"
              id="alerts-overview-modal-content"
            >
              <AlertFilters />

              <div className="bg-background bottom-0 gap-2 grid grid-cols-2 mt-5 py-2 px-3 sticky">
                <SheetClose className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-md w-full">
                  Back To Alerts
                </SheetClose>

                <ResetFiltersButton />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-1">
        {loading.isFetching ? (
          <div className="mt-6 space-y-6">
            <LoadingMissions
              total={2}
              section
              showTitle
            />
            <LoadingMissions
              total={2}
              section
              showTitle
            />
          </div>
        ) : (
          <>
            <section
              className="space-y-2-"
              aria-labelledby="section-summary"
            >
              <TitleSection
                deps={data}
                id="section-summary"
              >
                Summary
              </TitleSection>
              <EmptySection
                total={Object.entries(alertRewards).length}
                title="No available rewards"
              >
                <ul className="gap-2 grid grid-cols-4">
                  {Object.entries(alertRewards).map(([itemId, item]) => (
                    <li
                      className="border flex items-center rounded"
                      key={itemId}
                    >
                      <div className="bg-muted-foreground/10 flex flex-shrink-0 h-8 items-center justify-center w-9">
                        <img
                          src={item.imageUrl}
                          className="size-6"
                        />
                      </div>
                      <div className="flex-grow px-2 text-center text-sm truncate">
                        {numberWithCommaSeparator(item.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>
              </EmptySection>
            </section>

            <EmptyResults
              className="mt-6"
              total={data.size}
            >
              {data
                .entries()
                .toArray()
                .map(([theaterId, missions]) => (
                  <ZoneSection
                    missions={missions}
                    theaterId={theaterId}
                    deps={data}
                    key={theaterId}
                  />
                ))}
            </EmptyResults>
          </>
        )}
      </div>
    </>
  )
}
