import { useTranslation } from 'react-i18next'

import { getRawDate, relativeTime } from '../../../lib/dates'
import { assets } from '../../../lib/repository'
import { cn } from '../../../lib/utils'

import type {
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

export function GiftReceiverInfo({ data }: { data: PartyPlayerLookupData }) {
  const { t } = useTranslation(['stw-operations', 'general'])
  const friendsWith = data.friendships.filter(
    (item) => item.status === 'friends'
  )
  const extraMutual =
    data.mutualFriendsTotal > data.mutualFriends.length
      ? data.mutualFriendsTotal - data.mutualFriends.length
      : 0
  const lastOnline = data.lastOnline ? relativeTime(data.lastOnline) : null
  const mutualNames = data.mutualFriends
    .map((friend) => friend.displayName)
    .join(', ')

  return (
    <div className="flex flex-col gap-2">
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
              names: friendsWith.map((item) => item.displayName).join(', '),
            })}
          </div>
        )}
      </div>

      <div className="text-muted-foreground text-xs">
        {t('party.friend-requests.sheet.selected-accounts')}
      </div>
      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
        {data.friendships.map((friendship) => (
          <FriendshipRow
            friendship={friendship}
            key={friendship.accountId}
          />
        ))}
      </div>
    </div>
  )
}

function FriendshipRow({
  friendship,
}: {
  friendship: PartyPlayerFriendship
}) {
  const { t } = useTranslation(['stw-operations'])
  const gift = getGiftStatus(friendship.created)

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
      <StatusBadge status={friendship.status} />
    </div>
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
