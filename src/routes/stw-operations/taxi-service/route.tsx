import type {
  TaxiServiceNotificationEventFriendAdded,
  TaxiServiceNotificationEventFriendRequestSend,
  TaxiServiceNotificationEventPartyInvite,
  TaxiServiceNotificationEventPartyMemberJoined,
} from '../../../state/stw-operations/taxi-service'

import { FormEvent, useRef, type ChangeEvent } from 'react'

import { useDebouncedCallback } from '@mantine/hooks'
import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import {
  ArrowDownLeftIcon,
  CrownIcon,
  SendIcon,
  Trash2,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
  X,
} from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

import { AutomationStatusType } from '../../../config/constants/automation'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { Combobox } from '../../../components/ui/extended/combobox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion'
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
  CardHeader,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { ScrollArea } from '../../../components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '../../../components/ui/sheet'
import { Switch } from '../../../components/ui/switch'
import { GoToTop } from '../../../components/go-to-top'

import { Route as RootRoute } from '../../__root'

import { useTaxiServiceNotifications } from '../../../hooks/stw-operations/taxi-service'
import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'
import { useTaxiServiceData } from './-hooks'

import { TaxiServiceNotificationType } from '../../../state/stw-operations/taxi-service'

import { cn, parseCustomDisplayName } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/taxi-service',
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
                {t('stw-operations.options.taxi-service')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function StatusItem({
  status,
  title,
}: {
  status: AutomationStatusType
  title: string
}) {
  return (
    <span
      className={cn(
        'flex gap-2 items-center',
        'before:content-[""] before:block before:size-2 before:rounded-full',
        {
          'before:bg-green-600': status === AutomationStatusType.LISTENING,
          // 'before:bg-gray-600': status === AutomationStatusType.LOADING,
          'before:bg-gray-600':
            status === AutomationStatusType.DISCONNECTED,
          'before:bg-red-400': status === AutomationStatusType.ERROR,
          // 'before:bg-yellow-600': status === AutomationStatusType.ISSUE,
        },
      )}
    >
      {title}
    </span>
  )
}

export function Content() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const {
    accounts,
    accountSelectorIsDisabled,
    options,
    selectedAccounts,

    customFilter,
    handleReloadAccounts,
    handleRemoveAccount,
    handleUpdateStatusAction,
    onSelectItem,
  } = useTaxiServiceData()
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  return (
    <>
      <div className="flex flex-grow">
        <div className="flex flex-col items-center justify-center mb-14 w-full">
          <Card
            className="max-w-lg w-full"
            id="selector-card"
          >
            <CardHeader className="border-b">
              <CardDescription className="flex gap-2">
                <StatusItem
                  status={AutomationStatusType.LISTENING}
                  title={t('auto-kick.statuses.listening')}
                />
                {/* <StatusItem
                  status={AutomationStatusType.ISSUE}
                  title="Issue"
                /> */}
                <StatusItem
                  status={AutomationStatusType.ERROR}
                  title={t('auto-kick.statuses.credential-error')}
                />
                <StatusItem
                  status={AutomationStatusType.DISCONNECTED}
                  title={t('auto-kick.statuses.disconnected')}
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Combobox
                    className="max-w-full"
                    emptyPlaceholder={t('form.accounts.no-options', {
                      ns: 'general',
                    })}
                    emptyContent={t('form.accounts.search-empty', {
                      ns: 'general',
                    })}
                    placeholder={t('form.accounts.select', {
                      ns: 'general',
                    })}
                    placeholderSearch={t('form.accounts.placeholder', {
                      ns: 'general',
                      context: !getMenuOptionVisibility(
                        'showTotalAccounts',
                      )
                        ? 'private'
                        : undefined,
                      total: options.length,
                    })}
                    options={options}
                    value={[]}
                    customFilter={customFilter}
                    onChange={() => {}}
                    onSelectItem={onSelectItem}
                    emptyContentClassname="py-6 text-center text-sm"
                    disabled={accountSelectorIsDisabled}
                    disabledItem={accountSelectorIsDisabled}
                    inputSearchIsDisabled={accountSelectorIsDisabled}
                    hideInputSearchWhenOnlyOneOptionIsAvailable
                    hideSelectorOnSelectItem
                  />
                  <div className="border-t flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        if (accounts.length <= 0) {
                          return
                        }

                        handleReloadAccounts(
                          accounts.map(({ accountId }) => accountId),
                        )()
                      }}
                      disabled={accounts.length <= 0}
                    >
                      {t(
                        'stw-operations:taxi-service.main.actions.restart-all',
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        if (accounts.length <= 0) {
                          return
                        }

                        accounts.forEach(({ accountId }) => {
                          handleRemoveAccount(accountId)()
                        })
                      }}
                      disabled={accounts.length <= 0}
                    >
                      {t(
                        'stw-operations:taxi-service.main.actions.remove-all',
                      )}
                    </Button>
                  </div>
                  <InputAddAccounts
                    accountIds={accounts.map(({ accountId }) => accountId)}
                    disabled={accounts.length <= 0}
                  />
                  <NotificationsSidebar />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="gap-4 grid grid-cols-2 max-w-lg mt-5 w-full">
            {accounts.map((account) => {
              const current = selectedAccounts[account.accountId]
              const isLoading =
                current.status === null ||
                current.status === AutomationStatusType.LOADING ||
                current.submittings.removing
              const disabledActions =
                current.submittings.connecting ||
                current.submittings.removing ||
                isLoading
              const isDisconnected =
                current.status === AutomationStatusType.DISCONNECTED
              const isError = current.status === AutomationStatusType.ERROR
              const isListening =
                current.status === AutomationStatusType.LISTENING

              const defaultActiveStatusValue =
                current.actions.activeStatus?.trim() ?? ''
              const defaultBusyStatusValue =
                current.actions.busyStatus?.trim() ?? ''

              return (
                <article
                  className="border rounded"
                  key={account.accountId}
                >
                  <div className="bg-muted-foreground/5 flex items-center min-h-8 px-0.5 py-0.5 text-center text-muted-foreground text-xs">
                    <span
                      className={cn(
                        'flex gap-1.5 items-center px-2 truncate',
                        {
                          'before:content-[""] before:block before:size-2 before:rounded-full':
                            current.status !==
                              AutomationStatusType.LOADING &&
                            current.status !== null,
                          'before:bg-green-600': isListening,
                          // 'before:bg-gray-600':
                          //   current.status === AutomationStatusType.LOADING,
                          'before:bg-gray-600': isDisconnected,
                          'before:bg-red-400': isError,
                          // 'before:bg-yellow-600':
                          //   current.status === AutomationStatusType.ISSUE,
                        },
                      )}
                    >
                      {parseCustomDisplayName(account)}
                    </span>
                    <div className="ml-auto">
                      <Button
                        type="button"
                        size="icon"
                        className={cn('px-0 size-8', {
                          'opacity-50 [&:not(:disabled)]:hover:opacity-85':
                            !isLoading,
                        })}
                        variant="ghost"
                        onClick={
                          !isLoading
                            ? handleReloadAccounts([account.accountId])
                            : undefined
                        }
                        disabled={disabledActions}
                      >
                        {isLoading ? (
                          <UpdateIcon className="animate-spin" />
                        ) : (
                          <UpdateIcon className="size-3.5" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        className={cn('px-0 size-8', {
                          'text-[#ff6868]/60 [&:not(:disabled)]:hover:text-[#ff6868]':
                            !isLoading,
                        })}
                        variant="ghost"
                        onClick={
                          !isLoading
                            ? handleRemoveAccount(account.accountId)
                            : undefined
                        }
                        disabled={disabledActions}
                      >
                        {isLoading ? (
                          <UpdateIcon className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 px-3 py-2 text-sm">
                    <div className="flex flex-grow items-center justify-between">
                      <span>
                        {t('stw-operations:taxi-service.card.power-level')}
                      </span>
                      <Switch
                        checked={current.actions.high}
                        onCheckedChange={
                          !isLoading
                            ? handleUpdateStatusAction(
                                'high',
                                account.accountId,
                              )
                            : undefined
                        }
                        disabled={disabledActions}
                      />
                    </div>
                    <div className="flex flex-grow items-center justify-between">
                      <span>
                        {t(
                          'stw-operations:taxi-service.card.deny-requests',
                        )}
                      </span>
                      <Switch
                        checked={current.actions.denyFriendsRequests}
                        onCheckedChange={
                          !isLoading
                            ? handleUpdateStatusAction(
                                'denyFriendsRequests',
                                account.accountId,
                              )
                            : undefined
                        }
                        disabled={disabledActions}
                      />
                    </div>
                    <InputActiveStatus
                      placeholder={t(
                        'stw-operations:taxi-service.card.status.active',
                      )}
                      onChange={(value) =>
                        handleUpdateStatusAction(
                          'activeStatus',
                          account.accountId,
                        )(value)
                      }
                      defaultValue={defaultActiveStatusValue}
                      disabled={disabledActions}
                    />
                    <InputActiveStatus
                      placeholder={t(
                        'stw-operations:taxi-service.card.status.busy',
                      )}
                      onChange={(value) =>
                        handleUpdateStatusAction(
                          'busyStatus',
                          account.accountId,
                        )(value)
                      }
                      defaultValue={defaultBusyStatusValue}
                      disabled={disabledActions}
                    />
                    <InputAddAccounts
                      accountIds={[account.accountId]}
                      disabled={disabledActions}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>

      <GoToTop containerId="selector-card" />
    </>
  )
}

function InputActiveStatus({
  defaultValue,
  disabled,
  placeholder,
  onChange,
}: {
  defaultValue?: string
  disabled: boolean
  placeholder: string
  onChange?: (value: string) => void
}) {
  const debouncedHandleStatus = useDebouncedCallback((value: string) => {
    onChange?.(value)
  }, 500)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    debouncedHandleStatus(
      event.currentTarget.value.replace(/[\s]+/gi, ' '),
    )
  }

  return (
    <div className="">
      <Input
        placeholder={placeholder}
        className="h-8"
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={handleChange}
      />
    </div>
  )
}

function InputAddAccounts({
  accountIds,
  disabled = false,
}: {
  accountIds: Array<string>
  disabled?: boolean
}) {
  const { t } = useTranslation(['stw-operations'])

  const $input = useRef<HTMLInputElement>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (accountIds.length <= 0) {
      return
    }

    const displayNames = ($input.current?.value.split(';') ?? []).reduce(
      (accumulator, current) => {
        const name = current.trim()

        if (name.length > 0 && !accumulator.includes(name)) {
          accumulator.push(name)
        }

        return accumulator
      },
      [] as Array<string>,
    )

    if (displayNames.length <= 0) {
      return
    }

    window.electronAPI.taxiServiceAddAccounts(accountIds, displayNames)

    if ($input.current) {
      $input.current.value = ''
    }
  }

  return (
    <div className="border-t pt-2">
      <form
        className="space-y-2"
        onSubmit={handleSubmit}
      >
        <Input
          placeholder={t('taxi-service.main.search.input.placeholder')}
          className="h-8"
          disabled={disabled}
          ref={$input}
        />
        <Button
          className="h-8 w-full"
          size="sm"
          variant="secondary"
          type="submit"
          disabled={disabled}
        >
          {t('taxi-service.main.search.send')}
        </Button>
      </form>
    </div>
  )
}

function NotificationsSidebar() {
  const { t } = useTranslation(['stw-operations'])

  const { data, clearData } = useTaxiServiceNotifications()

  return (
    <div className="">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="w-full"
            size="sm"
            variant="outline"
          >
            {t('stw-operations:taxi-service.main.show-notifications')}
            <span className="sr-only">toggle notifications sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          className="flex flex-col p-0"
          hideCloseButton
        >
          <div className="w-full">
            <div className="app-draggable-region flex gap-1.5 h-[var(--header-height)] items-center px-1.5">
              <div className="flex items-center w-full">
                <div className="not-draggable-region">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={clearData}
                  >
                    {t('taxi-service.notifications.clear-logs')}
                  </Button>
                </div>
                <SheetClose className="not-draggable-region ml-auto mr-3">
                  <X />
                  <span className="sr-only">close history sidebar</span>
                </SheetClose>
              </div>
            </div>
            <div className="mx-2">
              <div className="border-l-4 italic mb-1.5 pl-2 py-1 text-muted-foreground text-xs">
                一
              </div>
              <ScrollArea className="h-[calc(100vh-var(--header-height)-1.875rem-0.375rem)]">
                <div className="text-sm w-full">
                  <ul className="flex flex-col gap-1- [&>li]:py-1 [&>li:not(:last-child)]:border-b">
                    {data.map((notification) => {
                      if (
                        notification.type ===
                        TaxiServiceNotificationType.FriendRequestSend
                      ) {
                        return (
                          <NotificationFriendRequestSend
                            data={notification}
                            key={notification.id}
                          />
                        )
                      }

                      if (
                        notification.type ===
                        TaxiServiceNotificationType.FriendAdded
                      ) {
                        return (
                          <NotificationFriendAdded
                            data={notification}
                            key={notification.id}
                          />
                        )
                      }

                      if (
                        notification.type ===
                        TaxiServiceNotificationType.PartyInvite
                      ) {
                        return (
                          <NotificationPartyInvite
                            data={notification}
                            key={notification.id}
                          />
                        )
                      }

                      if (
                        notification.type ===
                        TaxiServiceNotificationType.PartyMemberJoined
                      ) {
                        return (
                          <NotificationPartyMemberJoined
                            data={notification}
                            key={notification.id}
                          />
                        )
                      }

                      return null
                    })}
                  </ul>
                </div>
              </ScrollArea>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function NotificationPartyMemberJoined({
  data,
}: {
  data: TaxiServiceNotificationEventPartyMemberJoined
}) {
  return (
    <li className="">
      <Accordion
        type="single"
        className="w-full"
        collapsible
      >
        <AccordionItem
          className="border-0 p-0"
          value={data.id}
        >
          <AccordionTrigger className="flex-0 gap-2 items-center justify-start leading-5 px-0 py-0 text-left">
            <UsersIcon
              className="no-animate text-muted-foreground"
              size={20}
            />
            <div className="">
              <Trans
                ns="stw-operations"
                i18nKey="taxi-service.notifications.party-member-joined"
                values={{
                  me: data.me.displayName,
                  total: data.members.length,
                  createdAt: data.createdAt,
                }}
              >
                <strong>{data.me.displayName}</strong> joined a party of{' '}
                {data.members.length}
                <div className="text-muted-foreground text-xs">
                  一 {data.createdAt}
                </div>
              </Trans>
            </div>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 pb-1 text-balance">
            <ul className="flex flex-col gap-1 text-muted-foreground">
              {data.members.map((member) => (
                <li
                  className={cn('flex gap-1 items-center', {
                    'pl-4': !member.isLeader && !member.isSender,
                  })}
                  key={member.accountId}
                >
                  {member.isLeader && <CrownIcon size={12} />}
                  {member.isSender && <SendIcon size={12} />}
                  <strong>{member.displayName}</strong>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </li>
  )
}

function NotificationPartyInvite({
  data,
}: {
  data: TaxiServiceNotificationEventPartyInvite
}) {
  return (
    <li className="flex gap-2 items-center">
      <div className="flex-shrink-0 size-5">
        <ArrowDownLeftIcon
          className="text-muted-foreground"
          size={20}
        />
      </div>
      <div className="flex-grow">
        <Trans
          ns="stw-operations"
          i18nKey="taxi-service.notifications.party-invite"
          values={{
            friend: data.friend.displayName,
            me: data.me.displayName,
            createdAt: data.createdAt,
          }}
        >
          <strong>{data.friend.displayName}</strong> invited to{' '}
          <strong>{data.me.displayName}</strong>{' '}
          <div className="text-muted-foreground text-xs">
            一 {data.createdAt}
          </div>
        </Trans>
      </div>
    </li>
  )
}

function NotificationFriendAdded({
  data,
}: {
  data: TaxiServiceNotificationEventFriendAdded
}) {
  return (
    <li className="flex gap-2 items-center">
      <div className="flex-shrink-0 size-5">
        <UserCheckIcon
          className="text-green-500"
          size={20}
        />
      </div>
      <div className="flex-grow">
        <Trans
          ns="stw-operations"
          i18nKey="taxi-service.notifications.friend-added"
          values={{
            friend: data.friend.displayName,
            me: data.me.displayName,
          }}
        >
          <strong>{data.friend.displayName}</strong> added to{' '}
          <strong>{data.me.displayName}</strong>
        </Trans>
      </div>
    </li>
  )
}

function NotificationFriendRequestSend({
  data,
}: {
  data: TaxiServiceNotificationEventFriendRequestSend
}) {
  if (!data.withErrors) {
    return (
      <li className="">
        <div className="flex gap-2 items-center">
          <UserCheckIcon
            className="text-muted-foreground"
            size={18}
          />
          <div className="">
            <Trans
              ns="stw-operations"
              i18nKey="taxi-service.notifications.friend-request-send"
              values={{
                me: data.me.displayName,
                initial: data.accounts.length,
                total: data.accounts.length,
              }}
            >
              <strong>{data.me.displayName}</strong> sent{' '}
              {data.accounts.length}/{data.accounts.length} friend requests
            </Trans>
          </div>
        </div>
      </li>
    )
  }

  const withErrors = data.accounts.filter(
    (item) => item.error !== undefined,
  )

  return (
    <li className="">
      <Accordion
        type="single"
        className="w-full"
        collapsible
      >
        <AccordionItem
          className="border-0 p-0"
          value={data.id}
        >
          <AccordionTrigger className="flex-0 gap-2 items-center justify-start leading-5 px-0 py-0 text-left">
            <UserPlusIcon
              className="no-animate text-muted-foreground"
              size={18}
            />
            <div className="">
              <Trans
                ns="stw-operations"
                i18nKey="taxi-service.notifications.friend-request-send"
                values={{
                  me: data.me.displayName,
                  initial: data.accounts.length - withErrors.length,
                  total: data.accounts.length,
                }}
              >
                <strong>{data.me.displayName}</strong> sent{' '}
                {data.accounts.length - withErrors.length}/
                {data.accounts.length} friend requests
              </Trans>
            </div>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 pb-1 text-balance">
            <ul className="flex flex-col gap-1 text-muted-foreground">
              {withErrors.map((item) => (
                <li key={item.accountId}>
                  <Trans
                    ns="stw-operations"
                    i18nKey="taxi-service.notifications.friend-request-send-with-errors"
                    values={{
                      name: item.displayName,
                      error: item.error ?? 'unknown',
                    }}
                  >
                    <strong>{item.displayName}</strong> with error{' '}
                    <span className="bg-muted px-1 py-0.5 rounded text-xs">
                      {item.error}
                    </span>
                  </Trans>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </li>
  )
}
