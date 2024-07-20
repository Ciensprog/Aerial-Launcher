import type {
  XPBoostsDataWithAccountData,
  XPBoostType,
} from '../../../types/xpboosts'

import { Link, createRoute } from '@tanstack/react-router'
import { UpdateIcon } from '@radix-ui/react-icons'
import { Trash2, Undo2, X } from 'lucide-react'

import { repositoryAssetsURL } from '../../../config/about/links'
import { maxAmountLimitedTo } from '../../../config/constants/xpboosts'
import { fortniteDBProfileURL } from '../../../config/fortnite/links'

import { Route as RootRoute } from '../../__root'

import { AccountSelectors } from '../../../components/selectors/accounts'
import { SeparatorWithTitle } from '../../../components/ui/extended/separator'
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
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '../../../components/ui/command'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { RadioGroup } from '../../../components/ui/radio-group'
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

import { compactNumber } from '../../../lib/parsers/numbers'
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
  const { calculatedTotal, teammateXPBoostsFiltered } = useFilterXPBoosts({
    data,
    amountToSend: amountToSendParsedToNumber,
  })

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

              <SendBoostsSheet calculatedTotal={calculatedTotal} />
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
  calculatedTotal,
}: {
  calculatedTotal: number
}) {
  const {
    accountIdSelected,
    accountList,
    amountToSendIsInvalid,
    amountToSendParsedToNumber,
    consumePersonalBoostsButtonIsDisabled,
    consumeTeammateBoostsButtonIsDisabled,
    currentAccountSelected,
    dataFilterByPersonalType,
    generalIsSubmitting,
    inputSearchIsDisabled,
    isSubmittingPersonal,
    isSubmittingTeammate,
    noPersonalBoostsData,
    noTeammateBoostsData,
    sendBoostsButtonIsDisabled,
    xpBoostType,

    handleConsumePersonal,
    handleSetAccountIdSelected,
    handleSetXPBoostsType,
  } = useSendBoostsSheet()

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
              <div className="p-1">
                <div className="relative">
                  <Input
                    placeholder="Search by display name (epic username)"
                    disabled={inputSearchIsDisabled}
                  />
                </div>
                <p className="mt-3 px-2 text-sm">
                  Please select correct account:
                </p>
              </div>
              <ScrollArea>
                <Command
                  disablePointerSelection={
                    consumeTeammateBoostsButtonIsDisabled
                  }
                  loop
                >
                  <CommandList className="max-h-full">
                    <CommandGroup>
                      <RadioGroup className="gap-1">
                        <CommandItem
                          className={cn(
                            'border cursor-pointer gap-2 py-1 select-text',
                            {
                              'bg-muted ring-2 ring-white/20':
                                accountIdSelected ===
                                currentAccountSelected?.accountId,
                            }
                          )}
                          value={`${currentAccountSelected?.accountId}`}
                          onSelect={handleSetAccountIdSelected}
                        >
                          <a
                            href={fortniteDBProfileURL(
                              `${currentAccountSelected?.displayName}`
                            )}
                            className="flex-shrink-0"
                            onClick={(event) => {
                              event.preventDefault()

                              window.electronAPI.openExternalURL(
                                fortniteDBProfileURL(
                                  `${currentAccountSelected?.displayName}`
                                )
                              )
                            }}
                          >
                            <figure>
                              <img
                                src={`${repositoryAssetsURL}/images/eventcurrency_founders.png`}
                                className="size-4"
                                alt="fndb profile"
                              />
                            </figure>
                          </a>
                          <div className="text-muted-foreground truncate max-w-[40ch]">
                            {parseCustomDisplayName(
                              currentAccountSelected
                            )}
                          </div>
                        </CommandItem>
                        <SeparatorWithTitle classNameContainer="my-3">
                          Or
                        </SeparatorWithTitle>
                        {Array.from({ length: 12 }, () => null).map(
                          (_, index) => (
                            <CommandItem
                              className={cn(
                                'border cursor-pointer gap-2 py-1 select-text',
                                {
                                  'bg-muted ring-2 ring-white/20':
                                    accountIdSelected === `${index}`,
                                }
                              )}
                              value={`${index}`}
                              onSelect={handleSetAccountIdSelected}
                              key={index}
                            >
                              <a
                                href={`https://fortnitedb.com/profile/Sample`}
                                className="flex-shrink-0"
                                onClick={(event) => {
                                  event.preventDefault()

                                  window.electronAPI.openExternalURL(
                                    `https://fortnitedb.com/profile/Sample`
                                  )
                                }}
                              >
                                <figure>
                                  <img
                                    src={`${repositoryAssetsURL}/images/eventcurrency_founders.png`}
                                    className="size-4"
                                    alt="fndb"
                                  />
                                </figure>
                              </a>
                              <div className="text-muted-foreground truncate max-w-[40ch]">
                                {`External.v${index}`}
                              </div>
                            </CommandItem>
                          )
                        )}
                      </RadioGroup>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </ScrollArea>
              <div className="mb-5 mt-5 px-1">
                <Button
                  className="gap-1 w-full"
                  disabled={consumeTeammateBoostsButtonIsDisabled}
                >
                  {isSubmittingTeammate ? (
                    <UpdateIcon className="animate-spin" />
                  ) : noTeammateBoostsData ? (
                    'No accounts available'
                  ) : amountToSendIsInvalid ? (
                    'Please type a valid amount'
                  ) : accountIdSelected ? (
                    <>
                      Send
                      <span className="underline">
                        {compactNumber(calculatedTotal)}
                      </span>
                      to:
                      <span className="font-bold max-w-[25ch] truncate">
                        {parseCustomDisplayName(
                          accountList[accountIdSelected]
                        )}
                      </span>
                    </>
                  ) : (
                    'Please select an account'
                  )}
                </Button>
              </div>
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
