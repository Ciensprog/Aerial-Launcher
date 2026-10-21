import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { Filter, FolderOpen, Save, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { World } from '../../../config/constants/fortnite/world-info'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../components/ui/radio-group'
import { ScrollArea } from '../../../components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '../../../components/ui/sheet'
import { Switch } from '../../../components/ui/switch'

import { EmptyResults } from '../-components/-empty'
import { LoadingMissions } from '../-components/-loading'
import { AlertFilters } from '../-alerts-overview/-filters'
import { ResetFiltersButton } from '../-alerts-overview/-reset-filters-button'

import { cn } from '../../../lib/utils'

import { useMissionSwapPage } from './-hooks'
import { SwapVbucksSection, SwapZoneSection } from './-zone-section'

export function MissionSwap() {
  const { t } = useTranslation(['alerts'])

  const {
    $inputSearch,
    data,
    vbucks,
    inputSearch,
    loading,
    clearInputSearch,
    onChangeInputSearch,
    busy,
    yesterdayByTile,
    yesterdayFilename,
    yesterdayRaw,
    yesterdayMissing,
    selected,
    selectedCount,
    differentCount,
    onlyDifferent,
    onlyAlerts,
    hasTodayRaw,
    saveMode,
    outputDir,
    customFile,
    pickYesterday,
    unloadYesterday,
    selectDifferentAlerts,
    clearSelected,
    saveSwappedFile,
    setOnlyAlerts,
    setOnlyDifferent,
    setSaveMode,
    setOutputDir,
    setCustomFile,
    persistConfig,
    debouncedPersistConfig,
    pickOutputDir,
    pickOutputFile,
    toggleSelected,
  } = useMissionSwapPage()

  const yesterdayLoaded = Boolean(yesterdayRaw)

  return (
    <>
      <div className="flex gap-4 items-center">
        <div className="flex flex-grow items-center relative">
          <Input
            className={cn('h-9', {
              'pr-9': inputSearch.length > 0,
            })}
            placeholder={t('filters.search.input.placeholder')}
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
              {t('filters.search.submit-button')}
            </Button>
          </SheetTrigger>
          <SheetContent
            className="p-0 pt-2 w-[27rem] sm:max-w-full"
            hideCloseButton
          >
            <ScrollArea
              className="h-[calc(100vh-0.5rem)]"
              id="mission-swap-modal-content"
            >
              <AlertFilters />

              <div className="bg-background bottom-0 gap-2 grid grid-cols-2 mt-5 py-2 px-3 sticky">
                <SheetClose className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-md w-full">
                  {t('filters.actions.back')}
                </SheetClose>

                <ResetFiltersButton />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-3 space-y-3 rounded-md border bg-muted/20 p-3 text-sm">
        <p className="text-muted-foreground">{t('swap.help')}</p>

        <div className="flex flex-wrap gap-2 items-center">
          <Button
            size="sm"
            variant="secondary"
            onClick={pickYesterday}
            disabled={busy}
          >
            <FolderOpen className="mr-2 size-4" />
            {t('swap.load-yesterday')}
          </Button>
          {yesterdayFilename ? (
            <>
              <span className="font-medium">{yesterdayFilename}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={unloadYesterday}
              >
                {t('swap.unload-yesterday')}
              </Button>
            </>
          ) : (
            <span className="text-muted-foreground">
              {t(yesterdayMissing ? 'swap.missing-file' : 'swap.no-yesterday')}
            </span>
          )}
        </div>

        {yesterdayLoaded && (
          <>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Switch
                  id="swap-only-alerts"
                  checked={onlyAlerts}
                  onCheckedChange={setOnlyAlerts}
                />
                <Label htmlFor="swap-only-alerts">
                  {t('swap.only-alerts')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="swap-only-different"
                  checked={onlyDifferent}
                  onCheckedChange={setOnlyDifferent}
                />
                <Label htmlFor="swap-only-different">
                  {t('swap.only-different')}
                </Label>
              </div>
            </div>

            <RadioGroup
              value={saveMode}
              onValueChange={(value) =>
                setSaveMode(value as 'new' | 'overwrite')
              }
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="new"
                  id="swap-save-new"
                />
                <Label htmlFor="swap-save-new">
                  {t('swap.save-as-new')}
                </Label>
              </div>
              {saveMode === 'new' && (
                <div className="flex gap-2">
                  <Input
                    value={outputDir}
                    placeholder={t('swap.save-folder')}
                    onChange={(event) => {
                      const value = event.target.value
                      setOutputDir(value)
                      debouncedPersistConfig({ outputDir: value })
                    }}
                    onBlur={() => {
                      debouncedPersistConfig.flush()
                      persistConfig()
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={pickOutputDir}
                  >
                    {t('swap.pick-folder')}
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="overwrite"
                  id="swap-save-overwrite"
                />
                <Label htmlFor="swap-save-overwrite">
                  {t('swap.save-overwrite')}
                </Label>
              </div>
              {saveMode === 'overwrite' && (
                <div className="flex gap-2">
                  <Input
                    value={customFile}
                    placeholder={t('swap.save-file')}
                    onChange={(event) => {
                      const value = event.target.value
                      setCustomFile(value)
                      debouncedPersistConfig({ customFilePath: value })
                    }}
                    onBlur={() => {
                      debouncedPersistConfig.flush()
                      persistConfig()
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={pickOutputFile}
                  >
                    {t('swap.pick-file')}
                  </Button>
                </div>
              )}
            </RadioGroup>

            <div className="flex flex-wrap gap-2 items-center">
              <Button
                size="sm"
                variant="secondary"
                onClick={selectDifferentAlerts}
                disabled={differentCount <= 0}
              >
                {t('swap.select-different', { count: differentCount })}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelected}
                disabled={selectedCount <= 0}
              >
                {t('swap.clear-selected')}
              </Button>
              <Button
                size="sm"
                onClick={saveSwappedFile}
                disabled={
                  busy ||
                  selectedCount <= 0 ||
                  !hasTodayRaw ||
                  (saveMode === 'overwrite' && !customFile.trim())
                }
              >
                <Save className="mr-2 size-4" />
                {t('swap.save', { count: selectedCount })}
              </Button>
            </div>
          </>
        )}
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
          <EmptyResults
            className="mt-6"
            total={data.size + (vbucks.length > 0 ? 1 : 0)}
          >
            <SwapVbucksSection
              items={vbucks}
              deps={vbucks}
              yesterdayByTile={yesterdayByTile}
              yesterdayLoaded={yesterdayLoaded}
              selected={selected}
              onToggle={toggleSelected}
            />
            {Array.from(data.entries()).map(
              ([theaterId, missions]: [
                World,
                Collection<string, WorldInfoMission>,
              ]) => (
                <SwapZoneSection
                  missions={missions}
                  theaterId={theaterId}
                  deps={data}
                  yesterdayByTile={yesterdayByTile}
                  yesterdayLoaded={yesterdayLoaded}
                  selected={selected}
                  onToggle={toggleSelected}
                  key={theaterId}
                />
              ),
            )}
          </EmptyResults>
        )}
      </div>
    </>
  )
}
