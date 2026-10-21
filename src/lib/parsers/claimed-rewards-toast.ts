import type { AccountDataRecord } from '../../types/accounts'
import type { RewardsNotification } from '../../types/notifications'

import { enduranceWaveLines } from '../stw/endurance-waves'
import { numberWithCommaSeparator } from './numbers'
import { parseResource } from './resources'
import { toast } from '../notifications'
import { parseCustomDisplayName } from '../utils'

/** Avoid double toasts when the same claim is broadcast on multiple IPC channels. */
const recentlyToastedIds = new Set<string>()

export function getRewardDetailLines(
  notification: RewardsNotification,
): string[] {
  const lines: string[] = enduranceWaveLines(notification.endurance)

  Object.entries(notification.rewards).forEach(([key, quantity]) => {
    if (!quantity) {
      return
    }

    const item = parseResource({ key, quantity })

    lines.push(
      `${numberWithCommaSeparator(item.quantity)} × ${item.name}`,
    )
  })

  const accoladesTotal =
    (notification.accolades?.totalMissionXPRedeemed ?? 0) +
    (notification.accolades?.totalQuestXPRedeemed ?? 0)

  if (accoladesTotal > 0) {
    lines.push(`${numberWithCommaSeparator(accoladesTotal)} × Accolades`)
  }

  return lines
}

export function formatClaimedRewardsToastMessage({
  accountName,
  notification,
  title,
}: {
  accountName: string
  notification: RewardsNotification
  title: string
}): string | null {
  const lines = getRewardDetailLines(notification)

  if (lines.length <= 0) {
    return null
  }

  return [title.replace('{{name}}', accountName), ...lines].join('\n')
}

export function toastClaimedRewardsDetails({
  accountList,
  notifications,
  titleTemplate,
}: {
  accountList: AccountDataRecord
  notifications: Array<RewardsNotification>
  /** Use `{{name}}` as account name placeholder. */
  titleTemplate: string
}) {
  notifications.forEach((notification) => {
    if (recentlyToastedIds.has(notification.id)) {
      return
    }

    const accountName = parseCustomDisplayName(
      accountList[notification.accountId],
    )
    const message = formatClaimedRewardsToastMessage({
      accountName,
      notification,
      title: titleTemplate,
    })

    if (!message) {
      return
    }

    recentlyToastedIds.add(notification.id)
    window.setTimeout(() => {
      recentlyToastedIds.delete(notification.id)
    }, 8_000)

    const detailLines = getRewardDetailLines(notification).length
    const duration = Math.min(14_000, 4_000 + detailLines * 900)

    toast(message, { duration })
  })
}
