import type { RewardsNotification } from '../../types/notifications'

import { repositoryAssetsURL } from '../../config/about/links'

import { ScrollArea } from '../ui/scroll-area'

import { useClaimedRewards } from '../../hooks/stw-operations/claimed-rewards'

import { useGetAccounts } from '../../hooks/accounts'

import { parseResource } from '../../lib/parsers/resources'
import { parseCustomDisplayName } from '../../lib/utils'

export function HistoryMenu() {
  const { data } = useClaimedRewards()
  const dataOrderByDesc = data.toReversed()

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-3.5rem)]">
      {dataOrderByDesc.length > 0 ? (
        <>
          <div className="border-l-4 italic mb-4 mt-2 pl-2 py-1 text-muted-foreground">
            Note: this is a temporal history
          </div>
          <div className="flex-1 pb-6 [&_img]:pointer-events-none [&_img]:select-none">
            {dataOrderByDesc.map((item, index) => (
              <div
                className="border-b py-3 space-y-5 text-foreground/90 last:border-b-0"
                key={index}
              >
                <RewardSection data={item} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center text-muted-foreground min-h-[calc(100vh-3.5rem)]">
          Claimed Reward History
        </div>
      )}
    </ScrollArea>
  )
}

function RewardSection({ data }: { data: Array<RewardsNotification> }) {
  const { accountList } = useGetAccounts()

  return data.map((item, index) => (
    <div key={index}>
      <div className="font-bold mb-2 break-all">
        {parseCustomDisplayName(accountList[item.accountId])}:
      </div>
      <ul
        className="space-y-1"
        key={index}
      >
        <RewardItems rewards={item.rewards} />
        <AccoladesItem accolades={item.accolades} />
      </ul>
    </div>
  ))
}

function RewardItems({ rewards }: Pick<RewardsNotification, 'rewards'>) {
  const rawItems = Object.entries(rewards)
  const items = rawItems.map(([key, quantity]) =>
    parseResource({ key, quantity })
  )

  return items.map((item, index) => (
    <li key={index}>
      <figure className="flex gap-1 items-center">
        <img
          src={item.imgUrl}
          className="size-6"
          alt={item.name}
        />
        <figcaption className="break-all">
          {Intl.NumberFormat('en-US').format(item.quantity)} &times;{' '}
          {item.name}
        </figcaption>
      </figure>
    </li>
  ))
}

function AccoladesItem({
  accolades,
}: Pick<RewardsNotification, 'accolades'>) {
  return (
    <li>
      <figure className="flex gap-1 items-center">
        <img
          src={`${repositoryAssetsURL}/images/brxp.png`}
          className="size-6"
          alt="Accolades"
        />
        <figcaption className="break-all">
          {Intl.NumberFormat('en-US').format(
            accolades.totalMissionXPRedeemed +
              accolades.totalQuestXPRedeemed
          )}{' '}
          &times; Accolades
        </figcaption>
      </figure>
    </li>
  )
}
