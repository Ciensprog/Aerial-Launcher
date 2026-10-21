import type { ItemShopGiftHistoryEntry } from '../../types/item-shop'
import type { RewardsNotification } from '../../types/notifications'

import { ShoppingBag, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { RewardIcon } from '../reward-icon'
import { ScrollArea } from '../ui/scroll-area'
import { SheetClose } from '../ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

import {
  useClaimedRewards,
  useParseSummary,
} from '../../hooks/stw-operations/claimed-rewards'
import { useGetAccounts } from '../../hooks/accounts'
import { useItemShopStore } from '../../state/stw-operations/item-shop'

import { numberWithCommaSeparator } from '../../lib/parsers/numbers'
import { parseResource } from '../../lib/parsers/resources'
import { getShortDateFormat } from '../../lib/dates'
import { assets } from '../../lib/repository'
import { parseCustomDisplayName } from '../../lib/utils'

enum HistoryTabs {
  History = 'history',
  Summary = 'summary',
  Gifts = 'gifts',
}
const defaultSelectedTab: HistoryTabs = HistoryTabs.History

export function HistoryMenu() {
  const { t } = useTranslation(['history', 'general'])

  const { data } = useClaimedRewards()
  const dataOrderByDesc = data.toReversed()

  return (
    <>
      <Tabs
        className="w-full"
        defaultValue={defaultSelectedTab}
      >
        <div className="app-draggable-region flex gap-1.5 h-[var(--header-height)] items-center px-1.5">
          <TabsList className="not-draggable-region">
            <TabsTrigger value={HistoryTabs.History}>
              {t('history', {
                ns: 'general',
              })}
            </TabsTrigger>
            <TabsTrigger value={HistoryTabs.Summary}>
              {t('summary', {
                ns: 'general',
              })}
            </TabsTrigger>
            <TabsTrigger value={HistoryTabs.Gifts}>
              {t('gifts.title')}
            </TabsTrigger>
          </TabsList>
          <SheetClose className="not-draggable-region ml-auto mr-3">
            <X />
            <span className="sr-only">close history sidebar</span>
          </SheetClose>
        </div>
        <TabsContent
          value={HistoryTabs.History}
          className="mt-0 mx-1.5"
        >
          <div className="border-l-4 italic mb-1.5 pl-2 py-1 text-muted-foreground text-xs">
            {t('history.note')}
          </div>
          <ScrollArea className="h-[calc(100vh-var(--header-height)-1.875rem-0.375rem)]">
            {dataOrderByDesc.length > 0 ? (
              <>
                <div className="flex-1 pb-6 space-y-2">
                  {dataOrderByDesc.map((item) => (
                    <div
                      className="border-b pb-2 text-foreground/90 last:border-b-0"
                      key={item.id}
                    >
                      <RewardSection data={item} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyHistoryMessage title={t('history.empty')} />
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent
          value={HistoryTabs.Summary}
          className="mt-0 mx-1.5"
        >
          <div className="border-l-4 italic mb-1.5 mt-2- pl-2 py-1 text-muted-foreground text-xs">
            {t('summary.note')}
          </div>
          <ScrollArea className="h-[calc(100vh-var(--header-height)-1.875rem-0.375rem)]">
            <SummarySection />
          </ScrollArea>
        </TabsContent>
        <TabsContent
          value={HistoryTabs.Gifts}
          className="mt-0 mx-1.5"
        >
          <GiftHistorySection />
        </TabsContent>
      </Tabs>
    </>
  )
}

function GiftHistorySection() {
  const { t } = useTranslation(['history'])
  const gifts = useItemShopStore((state) => state.gifts)

  return (
    <ScrollArea className="h-[calc(100vh-var(--header-height)-1.875rem-0.375rem)]">
      {gifts.length > 0 ? (
        <div className="flex-1 pb-6 space-y-2">
          {gifts.map((gift) => (
            <GiftHistoryItem data={gift} key={gift.id} />
          ))}
        </div>
      ) : (
        <EmptyHistoryMessage title={t('gifts.empty')} />
      )}
    </ScrollArea>
  )
}

function GiftHistoryItem({ data }: { data: ItemShopGiftHistoryEntry }) {
  const { t } = useTranslation(['history'])

  return (
    <div className="border-b last:border-b-0 pb-2 px-2">
      <div className="flex gap-2 items-start">
        <div className="bg-muted/40 flex items-center justify-center overflow-hidden rounded size-12">
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt=""
              className="size-12 object-contain"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <ShoppingBag className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex gap-1.5 items-center">
            <div className="font-medium truncate">{data.title}</div>
            <span className="flex-shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {data.kind === 'purchase'
                ? t('gifts.kind-purchase')
                : t('gifts.kind-gift')}
            </span>
          </div>
          {data.kind === 'purchase' ? (
            <div className="text-muted-foreground text-xs">
              {t('gifts.bought-on', { name: data.fromDisplayName })}
            </div>
          ) : (
            <>
              <div className="text-muted-foreground text-xs">
                {t('gifts.from', { name: data.fromDisplayName })}
              </div>
              <div className="text-muted-foreground text-xs">
                {t('gifts.to', { name: data.toDisplayName })}
              </div>
            </>
          )}
          <div className="text-xs">
            {t('gifts.price', {
              price: numberWithCommaSeparator(data.price),
            })}
          </div>
          <div className="text-muted-foreground text-xs">
            {data.creatorCode
              ? t('gifts.creator', { code: data.creatorCode })
              : t('gifts.none-creator')}
          </div>
          <div className="text-muted-foreground text-xs">
            {getShortDateFormat(data.createdAt)}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummarySection() {
  const { t } = useTranslation(['history', 'general'])

  const { accountList } = useGetAccounts()
  const { accountsSummary, globalSummary } = useParseSummary()
  const isEmpty = Object.values(globalSummary.rewards).length <= 0

  if (isEmpty) {
    return <EmptyHistoryMessage title={t('summary.empty')} />
  }

  return (
    <Accordion
      className="w-full"
      type="multiple"
      defaultValue={['summary']}
    >
      <AccordionItem
        className="border-none"
        value="summary"
      >
        <AccordionTrigger className="bg-muted-foreground/5 px-2 py-2">
          {t('summary.all-accounts')}
        </AccordionTrigger>
        <AccordionContent className="px-2 py-2">
          <DateRange
            startsAt={globalSummary.startsAt}
            endsAt={globalSummary.endsAt}
          />
          <ul className="space-y-1">
            <RewardItems rewards={globalSummary.rewards} />
            <AccoladesItem accolades={globalSummary.accolades} />
          </ul>
        </AccordionContent>
      </AccordionItem>

      {accountsSummary.map((account) => (
        <AccordionItem
          className="border-none"
          value={account.accountId}
          key={account.accountId}
        >
          <AccordionTrigger className="bg-muted-foreground/5 px-2 py-2">
            {t(parseCustomDisplayName(accountList[account.accountId]), {
              ns: 'general',
            })}
            :
          </AccordionTrigger>
          <AccordionContent className="px-2 py-2">
            <DateRange
              startsAt={account.startsAt}
              endsAt={account.endsAt}
            />
            <ul className="space-y-1">
              <RewardItems rewards={account.rewards} />
              <AccoladesItem accolades={account.accolades} />
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

function DateRange({
  endsAt,
  startsAt,
}: {
  endsAt: string
  startsAt: string
}) {
  const { t } = useTranslation(['general'])

  return (
    <div className="mb-2 text-muted-foreground text-xs">
      <div>
        {t('first-claim', {
          date: startsAt === '' ? 'N/A' : getShortDateFormat(startsAt),
          interpolation: { escapeValue: false },
        })}
      </div>
      <div>
        {t('last-played', {
          date: endsAt === '' ? 'N/A' : getShortDateFormat(endsAt),
          interpolation: { escapeValue: false },
        })}
      </div>
    </div>
  )
}

function RewardSection({ data }: { data: RewardsNotification }) {
  const { t } = useTranslation(['general'])

  const { accountList } = useGetAccounts()

  return (
    <div className="px-2">
      <div className="font-bold mb-2 break-all">
        {t(parseCustomDisplayName(accountList[data.accountId]))}:
      </div>
      <ul className="space-y-1">
        {data.endurance?.map((row) => (
          <li
            key={`${row.zone}-${row.wave}`}
            className="text-sm"
          >
            {row.zone} Endurance · Wave {row.wave}
          </li>
        ))}
        <RewardItems rewards={data.rewards} />
        <AccoladesItem accolades={data.accolades} />
      </ul>
      <div className="mt-1 text-muted-foreground text-xs">
        {getShortDateFormat(data.createdAt)}
      </div>
    </div>
  )
}

function RewardItems({ rewards }: Pick<RewardsNotification, 'rewards'>) {
  const rawItems = Object.entries(rewards)
  const items = rawItems.map(([key, quantity]) =>
    parseResource({ key, quantity }),
  )

  return items.map((item) => (
    <li key={item.itemType}>
      <figure className="flex gap-1 items-center">
        <RewardIcon
          src={item.imgUrl}
          fallback={item.fallbackUrl}
          className="size-6"
          alt={item.name}
          title={item.name}
        />
        <figcaption className="break-all">
          {numberWithCommaSeparator(item.quantity)} &times; {item.name}
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
          src={assets('brxp')}
          className="size-6"
          alt="Accolades"
        />
        <figcaption className="break-all">
          {numberWithCommaSeparator(
            accolades.totalMissionXPRedeemed +
              accolades.totalQuestXPRedeemed,
          )}{' '}
          &times; Accolades
        </figcaption>
      </figure>
    </li>
  )
}

function EmptyHistoryMessage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center px-5 text-balance text-center text-muted-foreground min-h-[calc(100vh-var(--header-height)-1.875rem-0.375rem)]">
      {title}
    </div>
  )
}
