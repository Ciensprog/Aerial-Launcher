import type { RewardsNotification } from '../../types/notifications'

import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { repositoryAssetsURL } from '../../config/about/links'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { ScrollArea } from '../ui/scroll-area'
import { SheetClose } from '../ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

import {
  useClaimedRewards,
  useParseSummary,
} from '../../hooks/stw-operations/claimed-rewards'
import { useGetAccounts } from '../../hooks/accounts'

import { numberWithCommaSeparator } from '../../lib/parsers/numbers'
import { parseResource } from '../../lib/parsers/resources'
import { getShortDateFormat } from '../../lib/dates'
import { parseCustomDisplayName } from '../../lib/utils'

enum HistoryTabs {
  History = 'history',
  Summary = 'summary',
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
      </Tabs>
    </>
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
    parseResource({ key, quantity })
  )

  return items.map((item) => (
    <li key={item.itemType}>
      <figure className="flex gap-1 items-center">
        <img
          src={item.imgUrl}
          className="size-6"
          alt={item.name}
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
          src={`${repositoryAssetsURL}/images/brxp.png`}
          className="size-6"
          alt="Accolades"
        />
        <figcaption className="break-all">
          {numberWithCommaSeparator(
            accolades.totalMissionXPRedeemed +
              accolades.totalQuestXPRedeemed
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
