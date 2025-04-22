import type {
  ChangeEventHandler,
  MouseEventHandler,
  ReactNode,
} from 'react'
import type { MCPQueryProfileChanges } from '../../../types/services/mcp'
import type {
  XPBoostsDataWithAccountData,
  XPBoostType,
} from '../../../types/xpboosts'

import { createRoute } from '@tanstack/react-router'
import { UpdateIcon } from '@radix-ui/react-icons'
import { ExternalLink, Info, Send, Trash2, Undo2, X } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

import { repositoryAssetsURL } from '../../../config/about/links'
import {
  individualLimitBoostedXP,
  maxAmountLimitedTo,
} from '../../../config/constants/xpboosts'
import { fortniteDBProfileURL } from '../../../config/fortnite/links'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { AccountSelectors } from '../../../components/selectors/accounts'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { ScrollArea } from '../../../components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '../../../components/ui/sheet'
import { Switch } from '../../../components/ui/switch'
import { Toggle } from '../../../components/ui/toggle'

import { useInputPaddingButton } from '../../../hooks/ui/inputs'
import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'
import {
  useAccountDataItem,
  useData,
  useFilterXPBoosts,
  useSearchUser,
  useSendBoostsSheet,
} from './-hooks'
import { useWhy } from './-why'

import {
  compactNumber,
  numberWithCommaSeparator,
} from '../../../lib/parsers/numbers'
import {
  extractBoostedXP,
  extractXPBoosts,
  extractFounderStatus,
  extractCommanderLevel,
} from '../../../lib/parsers/query-profile'
import { whatIsThis } from '../../../lib/callbacks'
import { cn, parseCustomDisplayName } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/xpboosts',
  component: () => {
    const { t } = useTranslation(['sidebar'])

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('stw-operations.title')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {t('stw-operations.options.xp-boosts')}
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

  const {
    actionFormIsDisabled,
    accounts,
    amountToSend,
    amountToSendParsedToNumber,
    data,
    filteredData,
    isSubmitting,
    parsedSelectedAccounts,
    parsedSelectedTags,
    seeBoostsButtonIsDisabled,
    searchValue,
    summary,
    tags,

    handleChangeAmount,
    handleSearch,
    onChangeSearchValue,
    xpBoostsUpdateAccounts,
    xpBoostsUpdateTags,
  } = useData()
  const {
    inputSearchButtonIsDisabled,
    inputSearchDisplayName,
    searchUserIsSubmitting,
    searchedUser,

    handleChangeSearchDisplayName,
    handleSearchUser,
  } = useSearchUser()
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()
  const { showLink, handleXD, handleWhy } = useWhy({
    inputSearchValue: inputSearchDisplayName,
  })
  const { recalculateTotal, teammateXPBoostsFiltered } = useFilterXPBoosts(
    {
      data,
      amountToSend: amountToSendParsedToNumber,
    }
  )
  const [$updateInput, $updateButton] = useInputPaddingButton()

  const userBoosts = extractXPBoosts(
    searchedUser?.success && searchedUser?.data
      ? searchedUser.data.profileChanges
      : undefined
  )

  const handleOpenExternalFNDBProfileUrl =
    (accountId: string): MouseEventHandler<HTMLAnchorElement> =>
    (event) => {
      event.preventDefault()

      window.electronAPI.openExternalURL(fortniteDBProfileURL(accountId))
    }

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col max-w-lg w-full">
          <Card>
            <CardHeader className="border-b">
              <CardDescription>
                {t('xpboosts.top-search.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 px-0 space-y-4">
              <div className="grid gap-4 px-6">
                <div className="space-y-2">
                  <Label htmlFor="global-input-search-player">
                    {t('form.search-account.label', {
                      ns: 'general',
                    })}
                  </Label>
                  <form
                    className="flex items-center relative"
                    onSubmit={(event) => {
                      event.preventDefault()

                      if (!inputSearchButtonIsDisabled) {
                        handleSearchUser()
                        handleXD()
                        handleWhy()
                      }
                    }}
                  >
                    <Input
                      placeholder={t(
                        'form.search-account.input.placeholder',
                        {
                          ns: 'general',
                        }
                      )}
                      className="pr-[var(--pr-button-width)] pl-3 py-1"
                      value={inputSearchDisplayName}
                      onChange={handleChangeSearchDisplayName}
                      disabled={searchUserIsSubmitting}
                      id="global-input-search-player"
                      ref={$updateInput}
                    />
                    <Button
                      type="submit"
                      className="absolute h-8 px-2 py-1.5 right-1 text-sm w-28"
                      disabled={inputSearchButtonIsDisabled}
                      ref={$updateButton}
                    >
                      {searchUserIsSubmitting ? (
                        <UpdateIcon className="animate-spin h-4" />
                      ) : (
                        t('actions.search', {
                          ns: 'general',
                        })
                      )}
                    </Button>
                  </form>
                </div>

                {showLink && <PrayForXPBoosts />}

                {searchedUser &&
                  !searchedUser.success &&
                  !searchedUser.isPrivate && (
                    <div className="break-all mt-2 text-center text-muted-foreground">
                      {searchedUser.errorMessage
                        ? searchedUser.errorMessage
                        : t('form.player.search-empty', {
                            ns: 'general',
                          })}
                    </div>
                  )}
              </div>
              {searchedUser?.data && (
                <div className="px-6">
                  <div>
                    <div>
                      <a
                        href={fortniteDBProfileURL(
                          searchedUser.data.lookup.id
                        )}
                        className="inline-flex gap-2 items-center hover:opacity-75"
                        onClick={handleOpenExternalFNDBProfileUrl(
                          searchedUser.data.lookup.id
                        )}
                        onAuxClick={whatIsThis()}
                      >
                        <ExternalAuthTypeImage
                          externalAuthType={
                            searchedUser.data.lookup.externalAuthType
                          }
                        />
                        <span className="max-w-72 text-lg truncate">
                          {searchedUser.data.lookup.displayName}
                        </span>
                        <ExternalLink
                          className="stroke-muted-foreground"
                          size={16}
                        />
                      </a>
                    </div>
                    <div className="border-l-4 pl-3 space-y-0.5 text-muted-foreground text-sm [&_.icon-wrapper]:flex [&_.icon-wrapper]:items-center [&_.icon-wrapper]:justify-center [&_.icon-wrapper]:size-5">
                      {searchedUser.isPrivate ? (
                        <>
                          <AccountBasicInformationSection
                            title="Account Id:"
                            value={searchedUser.data.lookup.id}
                          />
                          <div className="py-1.5">
                            {t('public-stats', {
                              ns: 'general',
                            })}
                          </div>
                        </>
                      ) : (
                        searchedUser.success && (
                          <SearchedUserData
                            accountId={searchedUser.data.lookup.id}
                            boostedXP={searchedUser.data.profileChanges}
                            collectionBookLevel={
                              searchedUser.data.profileChanges.profile
                                .stats.attributes.collection_book
                                ?.maxBookXpLevelAchieved ?? 0
                            }
                            commanderLevel={
                              extractCommanderLevel(
                                searchedUser.data.profileChanges
                              ).total
                            }
                            daysLoggedIn={
                              searchedUser.data.profileChanges.profile
                                .stats.attributes.daily_rewards
                                ?.totalDaysLoggedIn ?? 0
                            }
                            founderStatus={
                              searchedUser.data.profileChanges
                            }
                            personalXPBoosts={userBoosts.personal}
                            teammateXPBoosts={userBoosts.teammate}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-5">
            <CardHeader className="border-b">
              <CardDescription>
                {t('xpboosts.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6">
              <AccountSelectors
                accounts={{
                  options: accounts,
                  value: parsedSelectedAccounts,
                }}
                tags={{
                  options: tags,
                  value: parsedSelectedTags,
                }}
                onUpdateAccounts={xpBoostsUpdateAccounts}
                onUpdateTags={xpBoostsUpdateTags}
                isDisabled={actionFormIsDisabled}
              />
              <Label htmlFor="amountToSend">
                {t('xpboosts.form.label', {
                  limit: compactNumber(maxAmountLimitedTo),
                })}
              </Label>
              <Input
                placeholder={t('xpboosts.form.input.placeholder')}
                value={amountToSend}
                onChange={handleChangeAmount}
                disabled={actionFormIsDisabled}
                id="amountToSend"
              />
            </CardContent>
            <CardFooter className="space-x-6">
              <Button
                className="w-full"
                onClick={handleSearch}
                disabled={seeBoostsButtonIsDisabled}
              >
                {isSubmitting ? (
                  <UpdateIcon className="animate-spin" />
                ) : data.length > 0 ? (
                  t('xpboosts.form.refetch')
                ) : (
                  t('xpboosts.form.see-boosts')
                )}
              </Button>

              <SendBoostsSheet recalculateTotal={recalculateTotal} />
            </CardFooter>
          </Card>

          {data.length > 0 && (
            <>
              <div className="mt-5 text-2xl text-center">
                {t('xpboosts.results.summary.title', {
                  total: data.length,
                })}
              </div>

              <div className="flex gap-4 max-w-lg min-w-56 mx-auto mt-5 rounded">
                <BoostSummaryItem
                  type="teammate"
                  quantity={summary.teammate}
                />
                <BoostSummaryItem
                  type="personal"
                  quantity={summary.personal}
                />
              </div>

              {data.length > 1 && (
                <div className="mt-5">
                  <Input
                    placeholder={t('form.accounts.placeholder', {
                      ns: 'general',
                      context: !getMenuOptionVisibility(
                        'showTotalAccounts'
                      )
                        ? 'private'
                        : undefined,
                      total: data.length,
                    })}
                    value={searchValue}
                    onChange={onChangeSearchValue}
                  />
                </div>
              )}

              {filteredData.length > 0 ? (
                <div className="gap-4 grid grid-cols-2 max-w-lg mt-5">
                  {filteredData.map((currentData) => (
                    <AccountInformation
                      data={currentData}
                      disableActions={actionFormIsDisabled}
                      teammateXPBoostsFiltered={
                        teammateXPBoostsFiltered[currentData.accountId] ??
                        0
                      }
                      key={currentData.accountId}
                    />
                  ))}
                </div>
              ) : (
                <div className="my-10 text-center text-muted-foreground">
                  <div className="my-2">
                    {t('form.accounts.search-empty', {
                      ns: 'general',
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SendBoostsSheet({
  recalculateTotal,
}: Pick<ReturnType<typeof useFilterXPBoosts>, 'recalculateTotal'>) {
  const { t } = useTranslation(['stw-operations'])

  const {
    success,

    // accountList,
    amountToSendIsInvalid,
    amountToSendParsedToNumber,
    consumePersonalBoostsButtonIsDisabled,
    consumeTeammateBoostsButtonIsDisabled,
    dataFilterByPersonalType,
    generalIsSubmitting,
    inputSearchDisplayName,
    inputSearchIsDisabled,
    inputSearchButtonIsDisabled,
    isSubmittingPersonal,
    isSubmittingTeammate,
    newCalculatedTotal,
    noPersonalBoostsData,
    noTeammateBoostsData,
    searchedUser,
    searchUserIsSubmitting,
    sendBoostsButtonIsDisabled,
    xpBoostType,

    handleChangeSearchDisplayName,
    handleConsumePersonal,
    handleConsumeTeammate,
    handleOpenExternalFNDBProfileUrl,
    handleSearchUser,
    handleSetXPBoostsType,
  } = useSendBoostsSheet({ recalculateTotal })

  const userBoosts = extractXPBoosts(
    searchedUser?.success && searchedUser?.data
      ? searchedUser.data.profileChanges
      : undefined
  )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          className="w-full"
          disabled={sendBoostsButtonIsDisabled}
        >
          {t('xpboosts.form.send-boosts')}
        </Button>
      </SheetTrigger>
      <SheetContent
        className="flex flex-col gap-2 pb-0 px-4 w-96"
        hideCloseButton
      >
        <div className="flex justify-center w-full">
          <SheetClose>
            <X />
            <span className="sr-only">Close history sidebar</span>
          </SheetClose>
        </div>
        <SheetHeader>
          <div className="flex flex-col text-center">
            {t('xpboosts.sidebar.title')}
            <div className="flex gap-3 items-center mt-2 mx-auto [&_img]:size-10">
              <figure
                className={cn({
                  grayscale: xpBoostType,
                })}
              >
                <img
                  src={`${repositoryAssetsURL}/images/resources/smallxpboost_gift.png`}
                />
              </figure>
              <Switch
                checked={xpBoostType}
                onCheckedChange={handleSetXPBoostsType}
                disabled={generalIsSubmitting}
              />
              <figure
                className={cn({
                  grayscale: !xpBoostType,
                })}
              >
                <img
                  src={`${repositoryAssetsURL}/images/resources/smallxpboost.png`}
                />
              </figure>
            </div>
          </div>
        </SheetHeader>
        <div className="flex flex-col overflow-x-hidden overflow-y-auto">
          {xpBoostType ? (
            noPersonalBoostsData ? (
              <div className="mt-14 text-center text-muted-foreground">
                {t('form.accounts.no-available', {
                  ns: 'general',
                })}
              </div>
            ) : (
              <>
                <div className="p-1">
                  <p className="px-2 text-sm">
                    {t('xpboosts.sidebar.personal.description')}
                  </p>
                </div>
                <ScrollArea>
                  <div className="flex flex-col gap-1 overflow-auto">
                    {dataFilterByPersonalType.map((item) => (
                      <div
                        className="border px-2 py-1 rounded-sm"
                        key={item.accountId}
                      >
                        <div className="text-muted-foreground text-sm truncate max-w-[40ch]">
                          {parseCustomDisplayName(item.account)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="mb-5 mt-5 px-1">
                  <Button
                    className="w-full"
                    onClick={handleConsumePersonal}
                    disabled={consumePersonalBoostsButtonIsDisabled}
                  >
                    {isSubmittingPersonal ? (
                      <UpdateIcon className="animate-spin" />
                    ) : noPersonalBoostsData ? (
                      t('form.accounts.no-available', {
                        ns: 'general',
                      })
                    ) : amountToSendIsInvalid ? (
                      t('xpboosts.sidebar.errors.valid-amount')
                    ) : (
                      t('xpboosts.sidebar.personal.submit-button', {
                        total: compactNumber(amountToSendParsedToNumber),
                      })
                    )}
                  </Button>
                </div>
              </>
            )
          ) : noTeammateBoostsData ? (
            <div className="mt-14 text-center text-muted-foreground">
              {t('form.accounts.no-available', {
                ns: 'general',
              })}
            </div>
          ) : (
            <>
              <div className="p-1">
                <form
                  className="space-y-1"
                  onSubmit={(event) => {
                    event.preventDefault()

                    if (!inputSearchButtonIsDisabled) {
                      handleSearchUser()
                    }
                  }}
                >
                  <Label
                    className="text-xs"
                    htmlFor="sheet-input-search-player"
                  >
                    {t('form.search-account.label', {
                      ns: 'general',
                    })}
                  </Label>
                  <SearchExternalAccount
                    searchUserIsSubmitting={searchUserIsSubmitting}
                    inputSearchDisplayName={inputSearchDisplayName}
                    handleChangeSearchDisplayName={
                      handleChangeSearchDisplayName
                    }
                    inputSearchIsDisabled={inputSearchIsDisabled}
                    inputSearchButtonIsDisabled={
                      inputSearchButtonIsDisabled
                    }
                  />
                </form>

                {searchedUser &&
                  !searchedUser.success &&
                  !searchedUser.isPrivate && (
                    <div className="break-all mt-14 text-center text-muted-foreground">
                      {searchedUser.errorMessage
                        ? searchedUser.errorMessage
                        : t('form.player.search-empty', {
                            ns: 'general',
                          })}
                    </div>
                  )}
              </div>
              {!noTeammateBoostsData && searchedUser?.data && (
                <>
                  <ScrollArea>
                    <div className="flex flex-col gap-1 overflow-auto px-1 pt-4">
                      <div>
                        <a
                          href={fortniteDBProfileURL(
                            searchedUser.data.lookup.id
                          )}
                          className="inline-flex gap-2 items-center hover:opacity-75"
                          onClick={handleOpenExternalFNDBProfileUrl(
                            searchedUser.data.lookup.id
                          )}
                          onAuxClick={whatIsThis()}
                        >
                          <ExternalAuthTypeImage
                            externalAuthType={
                              searchedUser.data.lookup.externalAuthType
                            }
                          />
                          <span className="max-w-72 text-lg truncate">
                            {searchedUser.data.lookup.displayName}
                          </span>
                          <ExternalLink
                            className="stroke-muted-foreground"
                            size={16}
                          />
                        </a>
                      </div>
                      <div className="border-l-4 pl-3 space-y-0.5 text-muted-foreground text-sm [&_.icon-wrapper]:flex [&_.icon-wrapper]:items-center [&_.icon-wrapper]:justify-center [&_.icon-wrapper]:size-5">
                        {searchedUser.isPrivate ? (
                          <>
                            <AccountBasicInformationSection
                              title={t('information.account-id', {
                                ns: 'general',
                              })}
                              value={searchedUser.data.lookup.id}
                            />
                            <div className="py-1.5">
                              {t('public-stats', {
                                ns: 'general',
                              })}
                            </div>
                          </>
                        ) : (
                          searchedUser.success && (
                            <SearchedUserData
                              accountId={searchedUser.data.lookup.id}
                              boostedXP={searchedUser.data.profileChanges}
                              collectionBookLevel={
                                searchedUser.data.profileChanges.profile
                                  .stats.attributes.collection_book
                                  ?.maxBookXpLevelAchieved ?? 0
                              }
                              commanderLevel={
                                extractCommanderLevel(
                                  searchedUser.data.profileChanges
                                ).total
                              }
                              daysLoggedIn={
                                searchedUser.data.profileChanges.profile
                                  .stats.attributes.daily_rewards
                                  ?.totalDaysLoggedIn ?? 0
                              }
                              founderStatus={
                                searchedUser.data.profileChanges
                              }
                              personalXPBoosts={userBoosts.personal}
                              teammateXPBoosts={userBoosts.teammate}
                            />
                          )
                        )}
                      </div>
                      <div className="mb-4 mt-4 px-1">
                        <div className="flex gap-1 items-center mb-4 px-1 text-muted-foreground text-xs">
                          <Info className="flex-shrink-0 relative size-3.5 top-[1px]" />
                          {t('xpboosts.sidebar.teammate.note')}
                        </div>
                        <Button
                          className="gap-1 w-full"
                          onClick={handleConsumeTeammate}
                          disabled={consumeTeammateBoostsButtonIsDisabled}
                        >
                          {isSubmittingTeammate ? (
                            <UpdateIcon className="animate-spin" />
                          ) : amountToSendIsInvalid ? (
                            t('xpboosts.sidebar.errors.valid-amount')
                          ) : (
                            <Trans
                              ns="stw-operations"
                              i18nKey="xpboosts.sidebar.teammate.submit-button"
                              values={{
                                total: compactNumber(newCalculatedTotal),
                                name: searchedUser.data.lookup.displayName,
                              }}
                            >
                              Send
                              <span className="underline">
                                {compactNumber(newCalculatedTotal)}
                              </span>
                              to:
                              <span className="font-bold max-w-[25ch] truncate">
                                {searchedUser.data.lookup.displayName}
                              </span>
                            </Trans>
                          )}
                        </Button>
                      </div>
                      <div className="mb-4 px-2 text-sm">
                        <div className="flex gap-1.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Send className="flex-shrink-0 size-3.5" />
                            {t('actions.success', {
                              ns: 'general',
                            })}
                            :
                          </div>{' '}
                          {numberWithCommaSeparator(success)}/
                          {numberWithCommaSeparator(newCalculatedTotal)}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SearchExternalAccount({
  inputSearchButtonIsDisabled,
  inputSearchDisplayName,
  inputSearchIsDisabled,
  searchUserIsSubmitting,

  handleChangeSearchDisplayName,
}: {
  inputSearchDisplayName: string
  inputSearchIsDisabled: boolean
  inputSearchButtonIsDisabled: boolean
  searchUserIsSubmitting: boolean

  handleChangeSearchDisplayName: ChangeEventHandler<HTMLInputElement>
}) {
  const { t } = useTranslation(['stw-operations'])

  const [$updateInput, $updateButton] = useInputPaddingButton()

  return (
    <div className="flex items-center relative">
      <Input
        placeholder={t('form.search-account.input.placeholder', {
          ns: 'general',
        })}
        className="pr-[var(--pr-button-width)] pl-3 py-1"
        value={inputSearchDisplayName}
        onChange={handleChangeSearchDisplayName}
        disabled={inputSearchIsDisabled}
        id="sheet-input-search-player"
        ref={$updateInput}
      />
      <Button
        type="submit"
        className="absolute h-8 px-2 py-1.5 right-1 text-sm w-16"
        disabled={inputSearchButtonIsDisabled}
        ref={$updateButton}
      >
        {searchUserIsSubmitting ? (
          <UpdateIcon className="animate-spin h-4" />
        ) : (
          t('actions.search', {
            ns: 'general',
          })
        )}
      </Button>
    </div>
  )
}

function BoostSummaryItem({
  type,
  quantity,
}: {
  type: XPBoostType
  quantity: number
}) {
  const isPersonal = type === 'personal'

  return (
    <div className="border rounded min-w-36">
      <figure className="bg-muted-foreground/5 flex flex-col items-center py-2">
        <img
          src={`${repositoryAssetsURL}/images/resources/smallxpboost${isPersonal ? '' : '_gift'}.png`}
          className="size-14"
        />
      </figure>
      <div className="break-all font-bold px-2 py-1 rounded-b text-center text-lg w-full">
        {compactNumber(quantity)}
      </div>

      {/* I might use this in the future. */}
      {/* <div className="border-t border-dashed break-all flex items-center gap-2 justify-center px-2 py-1 rounded-b text-center text-muted-foreground w-full">
        <Send size={14} />
        {compactNumber(0)}/{compactNumber(50)}
      </div> */}
    </div>
  )
}

function AccountInformation({
  data,
  disableActions,
  teammateXPBoostsFiltered,
}: {
  data: XPBoostsDataWithAccountData
  disableActions: boolean
  teammateXPBoostsFiltered: number
}) {
  const { t } = useTranslation(['stw-operations'])

  const {
    amountToSendParsedToNumber,
    isDisabled,
    isZero,
    handleChangeAvailability,
  } = useAccountDataItem({
    data,
  })

  return (
    <article
      className={cn('border rounded', {
        'border-muted/20': isDisabled,
      })}
    >
      <div
        className={cn(
          'bg-muted-foreground/5 flex items-center min-h-8 px-0.5 py-0.5 text-center text-muted-foreground text-xs',
          {
            'bg-muted-foreground/0': isDisabled,
          }
        )}
      >
        <span
          className={cn('px-2 truncate', {
            'opacity-40': isDisabled,
          })}
        >
          {parseCustomDisplayName(data.account)}
        </span>
        {!isZero && (
          <div className="ml-auto">
            <Toggle
              className={cn(
                'action px-0 size-8 data-[state=on]:hover:bg-muted/60',
                {
                  'data-[state=on]:bg-muted/20': isDisabled,
                }
              )}
              defaultPressed={isDisabled}
              onPressedChange={handleChangeAvailability}
              disabled={disableActions}
              aria-label="toggle availability"
            >
              {isDisabled ? <Undo2 size={14} /> : <Trash2 size={14} />}
            </Toggle>
          </div>
        )}
      </div>
      <footer className="rounded-b">
        <div
          className={cn('border-t gap-1 grid grid-cols-2 px-1', {
            'opacity-40': isDisabled,
          })}
        >
          <AccountSummaryItem
            type="teammate"
            data={data}
          />
          <AccountSummaryItem
            type="personal"
            data={data}
          />
        </div>
        <div
          className={cn(
            'border-t pt-2 px-3 text-muted-foreground text-xs',
            {
              'opacity-40': isDisabled,
            }
          )}
        >
          {t('xpboosts.results.options.description')}
        </div>
        <div
          className={cn('flex px-1', {
            'opacity-40': isDisabled,
          })}
        >
          <div className="flex items-center py-1">
            <figure className="flex-shrink-0 px-2">
              <img
                src={`${repositoryAssetsURL}/images/resources/smallxpboost_gift.png`}
                className="size-5"
              />
            </figure>
            <div className="flex-grow space-y-1">
              <div className="text-muted-foreground text-xs">
                {t('xpboosts.results.options.information', {
                  current: compactNumber(teammateXPBoostsFiltered),
                  total: compactNumber(data.items.teammate.quantity),
                  amount: compactNumber(amountToSendParsedToNumber),
                })}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </article>
  )
}

function AccountSummaryItem({
  data,
  type,
}: {
  data: XPBoostsDataWithAccountData
  type: XPBoostType
}) {
  const isPersonal = type === 'personal'

  return (
    <div className="flex items-center py-1 last:border-l">
      <figure className="flex-shrink-0 px-2">
        <img
          src={`${repositoryAssetsURL}/images/resources/smallxpboost${isPersonal ? '' : '_gift'}.png`}
          className="size-5"
        />
      </figure>
      <div className="flex-grow space-y-1">
        <div className="flex max-w-20 relative text-muted-foreground text-xs">
          <span className="truncate">
            {compactNumber(data.items[type]?.quantity)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ExternalAuthTypeImage({
  externalAuthType,
}: {
  externalAuthType?: 'psn' | 'xbl'
}) {
  return (
    <figure>
      <img
        src={`${repositoryAssetsURL}/images/logos/${
          externalAuthType ?? 'epicgames'
        }.png`}
        className="size-5"
      />
    </figure>
  )
}

export function AccountBasicInformationSection({
  title,
  value,
}: {
  title: ReactNode
  value: ReactNode
}) {
  return (
    <div className="break-all flex gap-1.5 items-center">
      <div className="flex flex-shrink-0 gap-1.5 items-center text-muted-foreground">
        {title}
      </div>
      <div className="text-white">{value}</div>
    </div>
  )
}

export function SearchedUserData({
  accountId,
  boostedXP,
  collectionBookLevel,
  commanderLevel,
  daysLoggedIn,
  founderStatus,
  personalXPBoosts,
  teammateXPBoosts,

  hideXPBoostsData,
}: {
  accountId: string
  boostedXP?: MCPQueryProfileChanges
  collectionBookLevel: number
  commanderLevel: number
  daysLoggedIn: number
  founderStatus?: MCPQueryProfileChanges
  personalXPBoosts: number
  teammateXPBoosts: number

  hideXPBoostsData?: boolean
}) {
  const { t } = useTranslation(['general'])

  const extractedBoostedXP = extractBoostedXP(boostedXP)
  const individualBoosts = Math.round(
    extractedBoostedXP / individualLimitBoostedXP
  )

  return (
    <>
      <AccountBasicInformationSection
        title={t('information.account-id')}
        value={accountId}
      />
      {/* <AccountBasicInformationSection
        title={t('information.power-level')}
        value="⚡130"
      /> */}
      <AccountBasicInformationSection
        title={t('information.commander-level')}
        value={numberWithCommaSeparator(commanderLevel)}
      />
      <AccountBasicInformationSection
        title={t('information.boosted-xp')}
        value={
          <div className="space-x-1.5">
            <span>{numberWithCommaSeparator(extractedBoostedXP)}</span>
            <span>
              ({numberWithCommaSeparator(individualBoosts)} {t('boosts')})
            </span>
          </div>
        }
      />
      <AccountBasicInformationSection
        title={t('information.days-logged-in')}
        value={numberWithCommaSeparator(daysLoggedIn)}
      />
      <AccountBasicInformationSection
        title={t('information.collection-book-level')}
        value={numberWithCommaSeparator(collectionBookLevel)}
      />
      {!hideXPBoostsData && (
        <>
          <AccountBasicInformationSection
            title={
              <>
                <figure className="size-5">
                  <img
                    src={`${repositoryAssetsURL}/images/resources/smallxpboost.png`}
                    className="size-[18px]"
                  />
                </figure>
                {t('information.personal-xp-boosts')}
              </>
            }
            value={numberWithCommaSeparator(personalXPBoosts)}
          />
          <AccountBasicInformationSection
            title={
              <>
                <figure className="size-5">
                  <img
                    src={`${repositoryAssetsURL}/images/resources/smallxpboost_gift.png`}
                    className="size-[18px]"
                  />
                </figure>
                {t('information.teammate-xp-boosts')}
              </>
            }
            value={numberWithCommaSeparator(teammateXPBoosts)}
          />
        </>
      )}
      <AccountBasicInformationSection
        title={
          <>
            <figure className="size-5">
              <img
                src={`${repositoryAssetsURL}/images/eventcurrency_founders.png`}
                className="size-[18px]"
              />
            </figure>
            {t('information.founder-status')}
          </>
        }
        value={t(`founder.${extractFounderStatus(founderStatus)}`)}
      />
    </>
  )
}

function PrayForXPBoosts() {
  const link = [
    'ht',
    'tps://',
    'do',
    'cs.g',
    'oog',
    'le.c',
    'om/doc',
    'ument/d',
    '/1nZo6T',
    'A3aTlb1u',
    '7SwxvnpJbg5',
    '5U0MQ',
    'RGcyNV0',
    'i-Xk',
    '1q',
    'Y',
  ]
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault()

    window.electronAPI.openExternalURL(link.join(''))
  }

  return (
    <div className="flex flex-col gap-2 text-center">
      <div className="text-2xl">🙏</div>
      <div className="font-bold text-lg">Súplica Al Potenciador</div>
      <a
        className="bg-muted/50 break-all flex px-2 py-1 rounded text-xs hover:opacity-85"
        href={link.join('')}
        onClick={handleClick}
        onAuxClick={whatIsThis()}
      >
        {link.join('')}
      </a>
    </div>
  )
}
