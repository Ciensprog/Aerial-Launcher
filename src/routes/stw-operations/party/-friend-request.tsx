import { UpdateIcon } from '@radix-ui/react-icons'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
} from '../../../components/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs'

import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'
import { useInputPaddingButton } from '../../../hooks/ui/inputs'
import { useFriendRequestActions } from './-hooks'

import { getRawDate, relativeTime } from '../../../lib/dates'
import { assets } from '../../../lib/repository'
import { cn } from '../../../lib/utils'

import type {
  PartyIncomingFriendRequest,
  PartyPlayerFriendship,
  PartyPlayerFriendshipStatus,
  PartyPlayerLookupData,
} from '../../../types/party'

const GIFT_UNLOCK_HOURS = 48

const PLATFORM_LABELS: Record<string, string> = {
  psn: 'PSN',
  xbl: 'Xbox',
  nintendo: 'Nintendo',
  steam: 'Steam',
  twitch: 'Twitch',
  google: 'Google',
}

export function FriendRequestCard() {
  const { t } = useTranslation(['stw-operations', 'general'])
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()
  const {
    customFilter,
    dialogOpen,
    hasValues,
    incomingRequests,
    inputSearchButtonIsDisabled,
    inputSearchDisplayName,
    isBusy,
    isIncomingLoading,
    isSearching,
    options,
    pendingAccountId,
    pendingIncomingKey,
    searchedUser,
    sheetTab,
    value,

    handleAcceptIncoming,
    handleAccountAction,
    handleChangeSearchDisplayName,
    handleDialogOpenChange,
    handleSearchUser,
    handleSheetTabChange,
    setDialogOpen,
    setValue,
  } = useFriendRequestActions()
  const [$updateInput, $updateButton] = useInputPaddingButton({
    deps: [isSearching, dialogOpen],
  })

  return (
    <>
      <Card className="flex min-w-0 flex-1 flex-col justify-center">
        <CardContent className="flex flex-col gap-2 p-2 pt-2">
          <Combobox
            className="h-8"
            placeholder={t('form.accounts.select', {
              ns: 'general',
            })}
            placeholderSearch={t('form.accounts.placeholder', {
              ns: 'general',
              context: !getMenuOptionVisibility('showTotalAccounts')
                ? 'private'
                : undefined,
              total: options.length,
            })}
            emptyContent={t('form.accounts.search-empty', {
              ns: 'general',
            })}
            options={options}
            value={value}
            customFilter={customFilter}
            onChange={setValue}
            isMulti
          />
          <Button
            className="h-8 w-full px-0.5"
            size="sm"
            onClick={() => setDialogOpen(true)}
            disabled={!hasValues}
          >
            <span className="flex-shrink-0 leading-4 text-balance truncate">
              {t('party.friend-requests.form.submit-button')}
            </span>
          </Button>
        </CardContent>
      </Card>

      <Sheet open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <SheetContent
          hideCloseButton
          className="flex flex-col gap-2 max-h-screen overflow-hidden pb-0 px-4 w-[26.875rem] max-w-[calc(100vw-1rem)]"
        >
          <div className="flex justify-center w-full">
            <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
          <SheetHeader>
            <div className="text-center text-sm font-medium">
              {t('party.friend-requests.sheet.title')}
            </div>
          </SheetHeader>
          <Tabs
            value={sheetTab}
            onValueChange={(value) =>
              handleSheetTabChange(value as 'search' | 'incoming')
            }
          >
            <TabsList className="grid h-8 w-full grid-cols-2">
              <TabsTrigger className="h-7 text-xs" value="search">
                {t('party.friend-requests.sheet.tabs-search')}
              </TabsTrigger>
              <TabsTrigger className="h-7 text-xs" value="incoming">
                {t('party.friend-requests.sheet.tabs-incoming')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {sheetTab === 'search' && (
            <>
              <form className="space-y-1" onSubmit={handleSearchUser}>
                <Label
                  className="text-xs"
                  htmlFor="party-friend-request-search"
                >
                  {t('party.friend-requests.sheet.label')}
                </Label>
                <div className="flex items-center relative">
                  <Input
                    placeholder={t(
                      'party.friend-requests.sheet.search-placeholder'
                    )}
                    className="pr-[var(--pr-button-width)] pl-3 py-1"
                    value={inputSearchDisplayName}
                    onChange={handleChangeSearchDisplayName}
                    disabled={isBusy}
                    id="party-friend-request-search"
                    ref={$updateInput}
                  />
                  <Button
                    type="submit"
                    className="absolute h-8 px-2 py-1.5 right-1 text-sm w-16"
                    disabled={inputSearchButtonIsDisabled}
                    ref={$updateButton}
                  >
                    {isSearching ? (
                      <UpdateIcon className="animate-spin h-4" />
                    ) : (
                      t('actions.search', {
                        ns: 'general',
                      })
                    )}
                  </Button>
                </div>
              </form>

              {searchedUser && !searchedUser.success && (
                <div className="break-all py-8 text-center text-muted-foreground">
                  {searchedUser.errorMessage
                    ? searchedUser.errorMessage
                    : t('form.player.search-empty', {
                        ns: 'general',
                      })}
                </div>
              )}

              {searchedUser?.success && (
                <div className="min-h-0 overflow-y-auto flex-1 pb-4">
                  <PlayerLookupResult
                    data={searchedUser.data}
                    pendingAccountId={pendingAccountId}
                    onAccountAction={handleAccountAction}
                  />
                </div>
              )}
            </>
          )}

          {sheetTab === 'incoming' && (
            <IncomingRequestsList
              isLoading={isIncomingLoading}
              pendingKey={pendingIncomingKey}
              requests={incomingRequests}
              onAccept={handleAcceptIncoming}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

function IncomingRequestsList({
  isLoading,
  pendingKey,
  requests,
  onAccept,
}: {
  isLoading: boolean
  pendingKey: string | null
  requests: Array<PartyIncomingFriendRequest>
  onAccept: (request: PartyIncomingFriendRequest) => void
}) {
  const { t } = useTranslation(['stw-operations'])
  const groups = groupIncomingRequests(requests)

  if (isLoading && requests.length <= 0) {
    return (
      <div className="break-all py-8 text-center text-muted-foreground">
        <UpdateIcon className="mr-2 inline animate-spin" />
        {t('party.friend-requests.sheet.incoming-loading')}
      </div>
    )
  }

  if (requests.length <= 0) {
    return (
      <div className="break-all py-8 text-center text-muted-foreground">
        {t('party.friend-requests.sheet.incoming-empty')}
      </div>
    )
  }

  return (
    <div className="min-h-0 overflow-y-auto flex-1 pb-4">
      <div className="flex flex-col gap-3 pr-1 pb-2">
        {groups.map((group) => (
          <div className="flex flex-col gap-1.5" key={group.accountId}>
            <div className="font-semibold text-[#e9c4cc] text-sm truncate">
              {group.accountDisplayName}
            </div>
            {group.requests.map((request) => {
              const key = `${request.accountId}:${request.friendId}`

              return (
                <AccountFriendshipCard
                  friendship={{
                    accountId: request.friendId,
                    created: request.created,
                    displayName: request.friendDisplayName,
                    status: 'incoming',
                  }}
                  isPending={pendingKey === key}
                  key={key}
                  onAction={() => onAccept(request)}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function groupIncomingRequests(
  requests: Array<PartyIncomingFriendRequest>
) {
  const groups: Array<{
    accountDisplayName: string
    accountId: string
    requests: Array<PartyIncomingFriendRequest>
  }> = []
  const indexByAccount = new Map<string, number>()

  requests.forEach((request) => {
    const existing = indexByAccount.get(request.accountId)

    if (existing === undefined) {
      indexByAccount.set(request.accountId, groups.length)
      groups.push({
        accountDisplayName: request.accountDisplayName,
        accountId: request.accountId,
        requests: [request],
      })

      return
    }

    groups[existing].requests.push(request)
  })

  return groups
}

function PlayerLookupResult({
  data,
  pendingAccountId,
  onAccountAction,
}: {
  data: PartyPlayerLookupData
  pendingAccountId: string | null
  onAccountAction: (accountId: string) => void
}) {
  const { t } = useTranslation(['stw-operations', 'general'])
  const friendsWith = data.friendships.filter(
    (item) => item.status === 'friends'
  )
  const extraMutual =
    data.mutualFriendsTotal > data.mutualFriends.length
      ? data.mutualFriendsTotal - data.mutualFriends.length
      : 0

  const lastOnline = data.lastOnline
    ? relativeTime(data.lastOnline)
    : null
  const mutualNames = data.mutualFriends
    .map((friend) => friend.displayName)
    .join(', ')

  return (
    <div className="flex flex-col gap-2 pr-1 pb-2">
      <div className="border rounded-lg bg-muted/20 p-3 space-y-2">
        <div>
          <div className="flex gap-2 items-center">
            <PlatformIcon type={data.lookup.externalAuthType} />
            <span className="font-semibold text-[#e9c4cc] truncate">
              {data.lookup.displayName}
            </span>
          </div>
          <div className="mt-1 text-muted-foreground text-xs break-all">
            {data.lookup.id}
            {lastOnline ? ` · ${lastOnline}` : ''}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data.lookup.externalAuths.map((auth) => (
            <span
              className="inline-flex gap-1 items-center border rounded-full px-2 py-0.5 text-[11px]"
              key={`${auth.type}-${auth.displayName}`}
            >
              <PlatformIcon type={auth.type} />
              {platformLabel(auth.type)} {auth.displayName}
            </span>
          ))}
          {data.mutualFriendsTotal > 0 && (
            <span className="border rounded-full px-2 py-0.5 text-[11px] text-muted-foreground">
              {data.mutualFriendsTotal}{' '}
              {t('party.friend-requests.sheet.mutual-friends')}
            </span>
          )}
        </div>
        {mutualNames !== '' && (
          <div className="text-muted-foreground text-xs">
            {mutualNames}
            {extraMutual > 0 ? ` +${extraMutual}` : ''}
          </div>
        )}
        {friendsWith.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {t('party.friend-requests.sheet.friends-with-accounts', {
              names: friendsWith
                .map((item) => item.displayName)
                .join(', '),
            })}
          </div>
        )}
      </div>

      <div className="text-muted-foreground text-xs">
        {t('party.friend-requests.sheet.selected-accounts')}
      </div>
      <div className="flex flex-col gap-1.5">
        {data.friendships.map((friendship) => (
          <AccountFriendshipCard
            friendship={friendship}
            isPending={pendingAccountId === friendship.accountId}
            key={friendship.accountId}
            onAction={() => onAccountAction(friendship.accountId)}
          />
        ))}
      </div>
    </div>
  )
}

function AccountFriendshipCard({
  friendship,
  isPending,
  onAction,
}: {
  friendship: PartyPlayerFriendship
  isPending: boolean
  onAction: () => void
}) {
  const { t } = useTranslation(['stw-operations'])
  const gift = getGiftStatus(friendship.created)
  const showAction =
    friendship.status === 'incoming' || friendship.status === 'not-friends'

  return (
    <div
      className={cn(
        'flex gap-2 items-center border rounded-lg bg-muted/20 px-3 py-2 border-l-4',
        stripeClass(friendship.status)
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[#e9c4cc] text-sm truncate">
          {friendship.displayName}
        </div>
        <div className="text-muted-foreground text-xs truncate">
          {rowSubtitle(friendship, gift, t)}
        </div>
      </div>
      {showAction ? (
        <AccountActionButton
          isPending={isPending}
          status={friendship.status}
          onAction={onAction}
        />
      ) : (
        <StatusBadge status={friendship.status} />
      )}
    </div>
  )
}

function AccountActionButton({
  isPending,
  status,
  onAction,
}: {
  isPending: boolean
  status: PartyPlayerFriendshipStatus
  onAction: () => void
}) {
  const { t } = useTranslation(['stw-operations'])

  if (status === 'incoming') {
    return (
      <Button
        className="flex-shrink-0 h-8 bg-blue-600 hover:bg-blue-600/90"
        size="sm"
        onClick={onAction}
        disabled={isPending}
      >
        {isPending ? (
          <UpdateIcon className="animate-spin" />
        ) : (
          t('party.friend-requests.sheet.accept')
        )}
      </Button>
    )
  }

  return (
    <Button
      className="flex-shrink-0 h-8"
      size="sm"
      onClick={onAction}
      disabled={isPending}
    >
      {isPending ? (
        <UpdateIcon className="animate-spin" />
      ) : (
        t('party.friend-requests.sheet.send')
      )}
    </Button>
  )
}

function StatusBadge({ status }: { status: PartyPlayerFriendshipStatus }) {
  const { t } = useTranslation(['stw-operations'])
  const styles: Record<PartyPlayerFriendshipStatus, string> = {
    friends: 'bg-emerald-950 text-emerald-300',
    outgoing: 'bg-amber-950 text-amber-300',
    incoming: 'bg-blue-950 text-blue-300',
    'not-friends': 'bg-zinc-800 text-zinc-400',
  }
  const labels: Record<PartyPlayerFriendshipStatus, string> = {
    friends: t('party.friend-requests.sheet.status-friends'),
    outgoing: t('party.friend-requests.sheet.status-outgoing'),
    incoming: t('party.friend-requests.sheet.status-incoming'),
    'not-friends': t('party.friend-requests.sheet.status-not-friends'),
  }

  return (
    <span
      className={cn(
        'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  )
}

function rowSubtitle(
  friendship: PartyPlayerFriendship,
  gift: ReturnType<typeof getGiftStatus>,
  t: ReturnType<typeof useTranslation>['t']
) {
  const parts = [statusDetail(friendship, t)]

  if (friendship.status === 'friends' && gift) {
    parts.push(
      gift.ready
        ? t('party.friend-requests.sheet.gifts-ready')
        : t('party.friend-requests.sheet.gifts-in', {
            time: gift.time,
          })
    )
  }

  return parts.join(' · ')
}

function statusDetail(
  friendship: PartyPlayerFriendship,
  t: ReturnType<typeof useTranslation>['t']
) {
  if (friendship.status === 'friends' && friendship.created) {
    return t('party.friend-requests.sheet.friends-since', {
      time: relativeTime(friendship.created),
    })
  }

  if (friendship.status === 'outgoing' && friendship.created) {
    return t('party.friend-requests.sheet.outgoing-sent', {
      time: relativeTime(friendship.created),
    })
  }

  if (friendship.status === 'incoming' && friendship.created) {
    return t('party.friend-requests.sheet.incoming-received', {
      time: relativeTime(friendship.created),
    })
  }

  if (friendship.status === 'outgoing') {
    return t('party.friend-requests.sheet.status-outgoing')
  }

  if (friendship.status === 'incoming') {
    return t('party.friend-requests.sheet.status-incoming')
  }

  return t('party.friend-requests.sheet.not-friends')
}

function stripeClass(status: PartyPlayerFriendshipStatus) {
  if (status === 'friends') {
    return 'border-l-emerald-400'
  }

  if (status === 'outgoing') {
    return 'border-l-amber-400'
  }

  if (status === 'incoming') {
    return 'border-l-blue-400'
  }

  return 'border-l-zinc-600'
}

function PlatformIcon({ type }: { type?: string }) {
  const iconType = type === 'psn' || type === 'xbl' ? type : 'epicgames'

  return (
    <img src={assets(iconType)} className="flex-shrink-0 size-4" alt="" />
  )
}

function platformLabel(type: string) {
  return PLATFORM_LABELS[type] ?? type
}

function getGiftStatus(created: string | null) {
  if (!created) {
    return null
  }

  const giftAt = getRawDate(created).add(GIFT_UNLOCK_HOURS, 'hour')

  if (giftAt.isAfter(getRawDate())) {
    return {
      ready: false,
      time: relativeTime(giftAt.toDate()),
    }
  }

  return {
    ready: true,
    time: null,
  }
}
