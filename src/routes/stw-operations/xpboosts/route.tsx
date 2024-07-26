import type { ReactNode } from 'react'
import type {
  XPBoostsDataWithAccountData,
  XPBoostType,
} from '../../../types/xpboosts'

import { Link, createRoute } from '@tanstack/react-router'
import { UpdateIcon } from '@radix-ui/react-icons'
import {
  // BookUp2,
  // ChevronsUp,
  ExternalLink,
  // LogIn,
  Trash2,
  // TrendingUp,
  Undo2,
  X,
} from 'lucide-react'

import { repositoryAssetsURL } from '../../../config/about/links'
import { maxAmountLimitedTo } from '../../../config/constants/xpboosts'
import { fortniteDBProfileURL } from '../../../config/fortnite/links'

import { Route as RootRoute } from '../../__root'

import { AccountSelectors } from '../../../components/selectors/accounts'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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

import {
  useAccountDataItem,
  useData,
  useFilterXPBoosts,
  useSendBoostsSheet,
} from './-hooks'

import {
  compactNumber,
  numberWithCommaSeparator,
} from '../../../lib/parsers/numbers'
import {
  extractBoostedXP,
  extractXPBoosts,
  extractFounderStatus,
} from '../../../lib/parsers/query-profile'
import { cn, parseCustomDisplayName } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/xpboosts',
  component: () => {
    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>STW Operations</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>XP Boosts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const {
    actionFormIsDisabled,
    accounts,
    amountToSend,
    amountToSendParsedToNumber,
    data,
    isSubmitting,
    parsedSelectedAccounts,
    parsedSelectedTags,
    seeBoostsButtonIsDisabled,
    summary,
    tags,

    handleChangeAmount,
    handleSearch,
    xpBoostsUpdateAccounts,
    xpBoostsUpdateTags,
  } = useData()
  const { recalculateTotal, teammateXPBoostsFiltered } = useFilterXPBoosts(
    {
      data,
      amountToSend: amountToSendParsedToNumber,
    }
  )

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center mb-10 w-full">
        <div className="flex flex-col max-w-lg w-full">
          <Card>
            <CardHeader className="border-b">
              <CardDescription>
                Manage XP Boosts of the selected accounts.
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
                Amount of XP Boosts to send{' '}
                <span className="italic">
                  (limited to {compactNumber(maxAmountLimitedTo)})
                </span>
              </Label>
              <Input
                placeholder="Example: 123"
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
                  'Refetch Boosts Data'
                ) : (
                  'See Boosts'
                )}
              </Button>

              <SendBoostsSheet recalculateTotal={recalculateTotal} />
            </CardFooter>
          </Card>

          {data.length > 0 && (
            <>
              <div className="mt-5 text-2xl text-center">
                Summary of {data.length} account
                {data.length > 1 ? 's' : ''}
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

              <div className="mt-5">
                <Input
                  placeholder={`Search on ${data.length} accounts`}
                  // value={searchValue}
                  // onChange={onChangeSearchValue}
                />
              </div>

              <div className="gap-4 grid grid-cols-2 max-w-lg mt-5">
                {data.map((data) => (
                  <AccountInformation
                    data={data}
                    disableActions={actionFormIsDisabled}
                    teammateXPBoostsFiltered={
                      teammateXPBoostsFiltered[data.accountId] ?? 0
                    }
                    key={data.accountId}
                  />
                ))}
              </div>
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
  const {
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
          Send Boosts
        </Button>
      </SheetTrigger>
      <SheetContent
        className="flex flex-col gap-2 pb-0 w-96"
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
            Which XP Boosts do you want to use?
            <div className="flex gap-3 items-center mt-2 mx-auto [&_img]:size-10">
              <figure
                className={cn({
                  grayscale: xpBoostType,
                })}
              >
                <img
                  src={`${repositoryAssetsURL}/images/resources/smallxpboost_gift.png`}
                  alt="Teammate"
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
                  alt="Personal"
                />
              </figure>
            </div>
          </div>
        </SheetHeader>
        <div className="flex flex-col overflow-auto">
          {noPersonalBoostsData || noTeammateBoostsData ? (
            <div className="mt-14 text-center text-muted-foreground">
              No accounts available
            </div>
          ) : xpBoostType ? (
            <>
              <div className="p-1">
                <p className="px-2 text-sm">
                  All of these accounts will use XP boosts:
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
                    'No accounts available'
                  ) : amountToSendIsInvalid ? (
                    'Please type a valid amount'
                  ) : (
                    `Consume ${compactNumber(amountToSendParsedToNumber)} XP Boost${amountToSendParsedToNumber > 1 ? 's' : ''} on each account`
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="p-1 space-y-1">
                <Label htmlFor="sheet-input-search-player">
                  Search player by display name (epic, xbl or psn)
                </Label>
                <div className="flex items-center relative">
                  <Input
                    placeholder="Example: Sample"
                    className="pr-20 pl-3 py-1"
                    value={inputSearchDisplayName}
                    onChange={handleChangeSearchDisplayName}
                    disabled={inputSearchIsDisabled}
                    id="sheet-input-search-player"
                  />
                  <Button
                    className="absolute h-8 px-2 py-1.5 right-1 text-sm w-16"
                    onClick={handleSearchUser}
                    disabled={inputSearchButtonIsDisabled}
                  >
                    {searchUserIsSubmitting ? (
                      <UpdateIcon className="animate-spin h-4" />
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>

                {searchedUser &&
                  !searchedUser.success &&
                  !searchedUser.isPrivate && (
                    <div className="mt-14 text-center text-muted-foreground">
                      {searchedUser.errorMessage
                        ? searchedUser.errorMessage
                        : 'No player found'}
                    </div>
                  )}
              </div>
              {!noTeammateBoostsData && searchedUser?.data && (
                <>
                  <ScrollArea>
                    <div className="flex flex-col gap-1 overflow-auto px-1 pt-4">
                      <div className="">
                        <a
                          href={fortniteDBProfileURL(
                            searchedUser.data.lookup.displayName
                          )}
                          className="inline-flex gap-2 items-center hover:opacity-75"
                          onClick={handleOpenExternalFNDBProfileUrl(
                            searchedUser.data.lookup.displayName
                          )}
                        >
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
                        {searchedUser?.isPrivate ? (
                          <>
                            <div className="py-1.5">
                              <div className="">Note:</div>
                              This user has "Public Game Stats" disabled,
                              more information can't be displayed.
                            </div>
                          </>
                        ) : (
                          searchedUser?.success && (
                            <>
                              {/* <AccountBasicInformationSection
                                title="Power Level:"
                                value="⚡130"
                              /> */}
                              <AccountBasicInformationSection
                                title="Commander Level:"
                                value={numberWithCommaSeparator(
                                  searchedUser.data.profileChanges.profile
                                    .stats.attributes.level +
                                    (searchedUser.data.profileChanges
                                      .profile.stats.attributes
                                      .rewards_claimed_post_max_level ?? 0)
                                )}
                              />
                              <AccountBasicInformationSection
                                title="Boosted XP:"
                                value={numberWithCommaSeparator(
                                  extractBoostedXP(
                                    searchedUser.data.profileChanges
                                  )
                                )}
                              />
                              <AccountBasicInformationSection
                                title="Days Logged In:"
                                value={numberWithCommaSeparator(
                                  searchedUser.data.profileChanges.profile
                                    .stats.attributes.daily_rewards
                                    ?.totalDaysLoggedIn
                                )}
                              />
                              <AccountBasicInformationSection
                                title="Collection Book Level:"
                                value={numberWithCommaSeparator(
                                  searchedUser.data.profileChanges.profile
                                    .stats.attributes.collection_book
                                    ?.maxBookXpLevelAchieved
                                )}
                              />
                              <AccountBasicInformationSection
                                title={
                                  <>
                                    <figure className="size-5">
                                      <img
                                        src={`${repositoryAssetsURL}/images/resources/smallxpboost.png`}
                                        className="size-[18px]"
                                        alt="FNDB Profile"
                                      />
                                    </figure>
                                    Personal XP Boosts:
                                  </>
                                }
                                value={numberWithCommaSeparator(
                                  userBoosts.personal
                                )}
                              />
                              <AccountBasicInformationSection
                                title={
                                  <>
                                    <figure className="size-5">
                                      <img
                                        src={`${repositoryAssetsURL}/images/resources/smallxpboost_gift.png`}
                                        className="size-[18px]"
                                        alt="FNDB Profile"
                                      />
                                    </figure>
                                    Teammate XP Boosts:
                                  </>
                                }
                                value={numberWithCommaSeparator(
                                  userBoosts.teammate
                                )}
                              />
                              <AccountBasicInformationSection
                                title={
                                  <>
                                    <figure className="size-5">
                                      <img
                                        src={`${repositoryAssetsURL}/images/eventcurrency_founders.png`}
                                        className="size-[18px]"
                                        alt="FNDB Profile"
                                      />
                                    </figure>
                                    Founder Status:
                                  </>
                                }
                                value={extractFounderStatus(
                                  searchedUser.data.profileChanges
                                )}
                              />
                            </>
                          )
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="mb-5 mt-4 px-1">
                    <Button
                      className="gap-1 w-full"
                      onClick={handleConsumeTeammate}
                      disabled={consumeTeammateBoostsButtonIsDisabled}
                    >
                      {isSubmittingTeammate ? (
                        <UpdateIcon className="animate-spin" />
                      ) : amountToSendIsInvalid ? (
                        'Please type a valid amount'
                      ) : (
                        <>
                          Send
                          <span className="underline">
                            {compactNumber(newCalculatedTotal)}
                          </span>
                          to:
                          <span className="font-bold max-w-[25ch] truncate">
                            {searchedUser.data.lookup.displayName}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
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
          alt={`${isPersonal ? 'Personal' : 'Friends'} XP Boosts`}
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
          Teammate XP Boosts to use:
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
                alt="Teammate XP Boosts"
              />
            </figure>
            <div className="flex-grow space-y-1">
              <div className="text-muted-foreground text-xs">
                {compactNumber(teammateXPBoostsFiltered)}/
                {compactNumber(data.items.teammate.quantity)} of a total of{' '}
                {compactNumber(amountToSendParsedToNumber)}
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
          alt={`${isPersonal ? 'Personal' : 'Teammate'} XP Boosts`}
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

function AccountBasicInformationSection({
  title,
  value,
}: {
  title: ReactNode
  value: ReactNode
}) {
  return (
    <div className="flex gap-1.5 items-center">
      <div className="flex flex-shrink-0 gap-1.5 items-center text-muted-foreground">
        {title}
      </div>{' '}
      <div className="text-white">{value}</div>
    </div>
  )
}
