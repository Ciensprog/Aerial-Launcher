import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { Check, FolderOpen, SquareCheckBigIcon, SquareIcon, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { AccountSelectors } from '../../../components/selectors/accounts'
import { Combobox } from '../../../components/ui/extended/combobox'
import { GoToTop } from '../../../components/go-to-top'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { ScrollArea } from '../../../components/ui/scroll-area'

import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'
import { cn, parseCustomDisplayName } from '../../../lib/utils'

import { useCloudStoragePage } from './-hooks'

function formatSize(length: number) {
  if (length >= 1024 * 1024) {
    return `${(length / (1024 * 1024)).toFixed(1)} MB`
  }

  if (length >= 1024) {
    return `${(length / 1024).toFixed(1)} KB`
  }

  return `${length} B`
}

function formatDate(value: string | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(undefined, { hour12: false })
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/cloud-storage',
  component: () => {
    const { t } = useTranslation(['sidebar'])

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('account-management.title')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {t('account-management.options.cloud-storage')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['stw-operations', 'general'])
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()
  const {
    accounts,
    accountList,
    applyIsDisabled,
    applyResults,
    customFilter,
    downloadIsDisabled,
    files,
    handleApply,
    handleDownload,
    handleLoad,
    handlePickLocal,
    handleSelectSource,
    handleToggleAll,
    isApplying,
    isDownloading,
    isListing,
    isPicking,
    listed,
    listError,
    localFiles,
    loadIsDisabled,
    parsedSelectedAccounts,
    parsedSelectedTags,
    selectedFilenames,
    sourceOptions,
    sourceValue,
    removeLocalFile,
    tags,
    toggleFilename,
    cloudStorageUpdateAccounts,
    cloudStorageUpdateTags,
  } = useCloudStoragePage()

  const selectedSet = new Set(selectedFilenames)

  return (
    <>
      <div className="flex flex-grow mb-10">
        <div className="flex items-start justify-center w-full">
          <div className="max-w-4xl space-y-3 w-full">
            <p className="text-sm text-muted-foreground">
              {t('cloud-storage.description')}
            </p>

            <div className="flex items-center gap-2 rounded-lg border p-2">
              <Combobox
                className="h-8 min-w-0 w-full max-w-none"
                placeholder={t('cloud-storage.source.title')}
                placeholderSearch={t('form.accounts.placeholder', {
                  ns: 'general',
                  context: !getMenuOptionVisibility('showTotalAccounts')
                    ? 'private'
                    : undefined,
                  total: sourceOptions.length,
                })}
                emptyContent={t('form.accounts.search-empty', {
                  ns: 'general',
                })}
                options={sourceOptions}
                value={sourceValue}
                customFilter={customFilter}
                onChange={handleSelectSource}
                hideSelectorOnSelectItem
              />
              <Button
                className="h-8 shrink-0 px-3"
                id="load-cloud-storage-button"
                size="sm"
                onClick={handleLoad}
                disabled={loadIsDisabled}
              >
                {isListing ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  t('cloud-storage.source.load')
                )}
              </Button>
            </div>

            <Card className="w-full">
              <CardContent className="p-0">
                {listError ? (
                  <div className="border-l-4 border-red-400 m-3 pl-2 text-red-400 text-sm">
                    {listError}
                  </div>
                ) : files.length <= 0 ? (
                  <div className="px-4 py-5 text-sm text-muted-foreground">
                    {t(
                      listed
                        ? 'cloud-storage.files.none'
                        : 'cloud-storage.files.empty',
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        onClick={handleToggleAll}
                      >
                        {selectedFilenames.length === files.length ? (
                          <SquareCheckBigIcon className="size-3.5 text-[var(--zone-color-stonewood)]" />
                        ) : (
                          <SquareIcon className="size-3.5" />
                        )}
                        {t('cloud-storage.files.selected', {
                          count: selectedFilenames.length,
                        })}
                      </button>
                      <div className="flex items-center gap-2">
                        <Button
                          className="h-8 px-3"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(false)}
                          disabled={downloadIsDisabled}
                        >
                          {isDownloading ? (
                            <UpdateIcon className="animate-spin" />
                          ) : (
                            t('cloud-storage.download.selected')
                          )}
                        </Button>
                        <Button
                          className="h-8 px-3"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(true)}
                          disabled={files.length <= 0 || isListing || isDownloading || isApplying}
                        >
                          {t('cloud-storage.download.all')}
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-52">
                      <ul className="divide-y">
                        {files.map((file) => {
                          const selected = selectedSet.has(file.uniqueFilename)

                          return (
                            <li key={file.uniqueFilename}>
                              <button
                                type="button"
                                className={cn(
                                  'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted/40',
                                  selected && 'bg-[rgb(52_211_117_/_8%)]',
                                )}
                                onClick={() => {
                                  toggleFilename(file.uniqueFilename)
                                }}
                              >
                                {selected ? (
                                  <SquareCheckBigIcon className="size-3.5 shrink-0 text-[var(--zone-color-stonewood)]" />
                                ) : (
                                  <SquareIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                                )}
                                <span className="min-w-0 flex-1 truncate">
                                  {file.filename}
                                </span>
                                <span className="shrink-0 text-xs text-muted-foreground">
                                  {formatSize(file.length)}
                                </span>
                                {file.uploaded ? (
                                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                                    {formatDate(file.uploaded)}
                                  </span>
                                ) : null}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </ScrollArea>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 rounded-lg border p-2">
              <Button
                className="h-8 shrink-0 px-3"
                size="sm"
                variant="secondary"
                onClick={handlePickLocal}
                disabled={isListing || isDownloading || isPicking || isApplying}
              >
                {isPicking ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  <>
                    <FolderOpen className="mr-1.5 size-3.5" />
                    {t('cloud-storage.local.browse')}
                  </>
                )}
              </Button>
              {localFiles.length <= 0 ? (
                <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                  {t('cloud-storage.local.empty')}
                </p>
              ) : (
                <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                  {localFiles.map((file) => (
                    <span
                      key={file.path}
                      className="inline-flex max-w-full items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs"
                      title={file.path}
                    >
                      <span className="min-w-0 truncate">{file.filename}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {formatSize(file.length)}
                      </span>
                      <button
                        type="button"
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label={t('cloud-storage.local.remove')}
                        onClick={() => {
                          removeLocalFile(file.path)
                        }}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-lg border p-2">
              <AccountSelectors
                layout="row"
                accountsPlaceholder={t('form.accounts.select', {
                  ns: 'general',
                })}
                accounts={{
                  options: accounts,
                  value: parsedSelectedAccounts,
                }}
                tags={{
                  options: tags,
                  value: parsedSelectedTags,
                }}
                onUpdateAccounts={cloudStorageUpdateAccounts}
                onUpdateTags={cloudStorageUpdateTags}
              />
              <Button
                className="h-8 shrink-0 px-3"
                size="sm"
                onClick={handleApply}
                disabled={applyIsDisabled}
              >
                {isApplying ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  t('cloud-storage.apply.submit')
                )}
              </Button>
            </div>

            {applyResults.length <= 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('cloud-storage.apply.empty')}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {applyResults.map((account) => {
                  const accountData = accountList[account.accountId]
                  const displayName = accountData
                    ? parseCustomDisplayName(accountData)
                    : account.accountId
                  const doneCount = account.files.filter((item) => item.ok).length
                  const total = account.files.length
                  const allDone = total > 0 && doneCount === total

                  return (
                    <div
                      key={account.accountId}
                      className="min-w-0 rounded-md border bg-background/40 px-2 py-1.5"
                    >
                      <div className="flex min-w-0 items-center gap-1.5">
                        <div className="min-w-0 truncate text-sm font-semibold text-[#e9c4cc]">
                          {displayName}
                        </div>
                        {account.available ? (
                          <Badge
                            variant="secondary"
                            className={cn(
                              'shrink-0 font-medium text-[11px]',
                              allDone && 'bg-emerald-500/20 text-emerald-300',
                            )}
                          >
                            {t('cloud-storage.apply.done', {
                              done: doneCount,
                              total,
                            })}
                          </Badge>
                        ) : null}
                      </div>
                      {account.errorMessage ? (
                        <div className="border-l-4 border-red-400 mt-1 pl-2 text-red-400 text-xs">
                          {account.errorMessage}
                        </div>
                      ) : (
                        <ul className="mt-1 space-y-0.5">
                          {account.files.map((item) => (
                            <li
                              key={item.filename}
                              className="flex min-w-0 items-center gap-1.5 text-xs"
                            >
                              {item.ok ? (
                                <Check className="size-3.5 shrink-0 text-emerald-400" />
                              ) : (
                                <X className="size-3.5 shrink-0 text-red-400" />
                              )}
                              <span
                                className={cn(
                                  'min-w-0 truncate',
                                  !item.ok && 'text-muted-foreground',
                                )}
                              >
                                {item.filename}
                                {item.errorMessage
                                  ? ` · ${item.errorMessage}`
                                  : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <GoToTop containerId="load-cloud-storage-button" />
    </>
  )
}
