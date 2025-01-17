import type { WorldInfoFileData } from '../../../types/data/advanced-mode/world-info'

import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import {
  CloudDownload,
  Eye,
  FileJson,
  FileSearch2,
  FileWarning,
  Save,
  Share,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LoadWorldInfoFiles } from '../../../bootstrap/components/advanced-mode/load-world-info-files'
import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardFooter } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
// import { Switch } from '../../../components/ui/switch'
import { GoToTop } from '../../../components/go-to-top'

import { useInputPaddingButton } from '../../../hooks/ui/inputs'
import {
  useCurrentActions,
  useData,
  useItemData,
  useSearch,
} from './-hooks'

import {
  getDateWithFormat,
  getShortDateFormat,
  relativeTime,
} from '../../../lib/dates'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/advanced-mode/world-info',
  component: () => {
    const { t } = useTranslation(['sidebar'], {
      keyPrefix: 'advanced-mode',
    })

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('options.world-info')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['advanced-mode', 'general'])

  const { currentData, files, isFetching, isSaving } = useData()
  const { handleRefetch, handleSave } = useCurrentActions()
  const {
    filteredFiles,
    // includeFileData,
    searchValue,
    onChangeSearchValue,
    // setIncludeFileData,
  } = useSearch({
    files,
  })

  return (
    <>
      <LoadWorldInfoFiles />

      <div className="flex flex-grow">
        <div className="flex items-center justify-center w-full">
          <div className="max-w-lg w-full">
            <div
              className="border flex mb-10 mt-5 mx-auto rounded w-80"
              id="form-current-world-info-container"
            >
              <div className="bg-muted-foreground/5 flex flex-col justify-center py-4 w-1/2">
                <div className="flex flex-shrink-0 justify-center mb-2 pl-2 pr-3">
                  {!isFetching && currentData.value ? (
                    <FileJson
                      className="stroke-muted-foreground"
                      size={32}
                    />
                  ) : isFetching ? (
                    <FileSearch2
                      className="stroke-muted-foreground"
                      size={32}
                    />
                  ) : (
                    <FileWarning
                      className="stroke-muted-foreground"
                      size={32}
                    />
                  )}
                </div>
                <div className="text-center">
                  <div className="font-bold leading-5 mb-1 text-balance text-lg">
                    {currentData.value ? currentData.date : 'N/A'}
                  </div>
                  <div className="font-medium text-muted-foreground text-xs uppercase">
                    {t('current', {
                      ns: 'general',
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 justify-center p-2 w-1/2">
                <Button
                  type="button"
                  className="gap-1 h-auto px-0 py-2 text-xs"
                  onClick={handleSave(currentData.date)}
                  disabled={isFetching || !currentData.value || isSaving}
                >
                  {isSaving ? (
                    <UpdateIcon className="animate-spin h-4" />
                  ) : (
                    <>
                      <Save size={16} />
                      {t('world-info.form.save')}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-1 h-auto px-0 py-2 text-xs"
                  onClick={handleRefetch}
                  disabled={isFetching || isSaving}
                >
                  {isFetching ? (
                    <UpdateIcon className="animate-spin h-4" />
                  ) : (
                    <>
                      <CloudDownload size={16} />
                      {t('world-info.form.refetch')}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mb-5">
              {files.length > 0 ? (
                <>
                  {files.length > 1 && (
                    <div className="flex gap-3 items-center mb-5">
                      <Input
                        placeholder={t(
                          'world-info.search.input.placeholder',
                          {
                            total: files.length,
                          }
                        )}
                        value={searchValue}
                        onChange={onChangeSearchValue}
                      />
                      {/* <div className="flex flex-shrink-0 gap-2 items-center text-muted-foreground w-1/3">
                        {t('world-info.search.include-data')}
                        <Switch
                          checked={includeFileData}
                          onCheckedChange={setIncludeFileData}
                        />
                      </div> */}
                    </div>
                  )}

                  <div className="gap-2 grid grid-cols-1">
                    {filteredFiles.length > 0 ? (
                      filteredFiles.map((data) => (
                        <Item
                          data={data}
                          key={data.id}
                        />
                      ))
                    ) : (
                      <div className="mt-10 text-center text-muted-foreground">
                        <FileWarning
                          size={48}
                          className="mx-auto"
                        />
                        <div className="mt-2">
                          {t('world-info.search.no-files')}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-20 text-center text-muted-foreground">
                  <FileWarning
                    size={48}
                    className="mx-auto"
                  />
                  <div className="mt-2">
                    {t('world-info.search.no-files')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <GoToTop containerId="form-current-world-info-container" />
    </>
  )
}

function Item({ data }: { data: WorldInfoFileData }) {
  const { t } = useTranslation(['advanced-mode', 'general'])

  const {
    handleDeleteFile,
    handleExportFile,
    handleOpenFile,
    handleUpdateName,
    name,
    onSubmit,
    validName,
  } = useItemData({ data })

  const [$updateInput, $updateButton] = useInputPaddingButton({
    deps: [validName],
  })

  return (
    <Card>
      <CardContent className="flex items-center px-2 py-2">
        <div className="flex-shrink-0 pl-2 pr-3">
          <FileJson
            className="stroke-muted-foreground"
            size={24}
          />
        </div>
        <form
          className="flex flex-grow items-center relative"
          onSubmit={onSubmit}
        >
          <Input
            className="h-auto pr-[var(--pr-button-width)] pl-3 py-1"
            placeholder={t('world-info.file.input.placeholder', {
              filename: getDateWithFormat(
                data.date,
                'YYYY-MM-DD HH[h] m[m] s[s]'
              ),
            })}
            value={name}
            onChange={handleUpdateName}
            ref={$updateInput}
          />
          <Button
            type="submit"
            variant="secondary"
            className="absolute h-auto px-2 py-0.5 right-1 text-sm w-auto"
            ref={$updateButton}
          >
            {validName
              ? t('actions.update', {
                  ns: 'general',
                })
              : t('actions.revert', {
                  ns: 'general',
                })}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="bg-muted-foreground/5 px-2 py-1 rounded-b">
        <div className="leading-4 py-0.5 rounded text-muted-foreground text-sm">
          {getShortDateFormat(data.date)}
          <span className="italic ml-1">
            ({relativeTime(data.createdAt)})
          </span>
        </div>
        <div className="flex ml-auto">
          <div className="flex border-r mr-1 pr-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="flex flex-shrink-0 justify-center size-8"
              onClick={handleOpenFile}
            >
              <Eye size={16} />
              <span className="sr-only">open file</span>
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="flex flex-shrink-0 justify-center size-8"
              onClick={handleExportFile}
            >
              <Share size={16} />
              <span className="sr-only">export file</span>
            </Button>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="flex flex-shrink-0 justify-center size-8 text-[#ff6868]/60 hover:text-[#ff6868]"
            onClick={handleDeleteFile}
          >
            <Trash2 size={16} />
            <span className="sr-only">remove file</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
