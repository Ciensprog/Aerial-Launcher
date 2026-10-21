import { useTranslation } from 'react-i18next'

import { EmptySection } from './-empty'

import { RewardIcon } from '../../../components/reward-icon'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'

export function RewardsSummaryList({
  rewards,
}: {
  rewards: Record<
    string,
    {
      fallbackUrl?: string
      imageUrl: string
      name?: string
      quantity: number
    }
  >
}) {
  const { t } = useTranslation(['alerts'])

  return (
    <EmptySection
      total={Object.entries(rewards).length}
      title={t('results.empty.rewards')}
    >
      <ul className="gap-1 grid grid-cols-4">
        {Object.entries(rewards).map(([itemId, item]) => (
          <li
            className="border flex items-center min-w-0 rounded"
            key={itemId}
            title={item.name}
          >
            <div className="bg-muted-foreground/10 flex flex-shrink-0 h-8 items-center justify-center w-9">
              <RewardIcon
                src={item.imageUrl}
                fallback={item.fallbackUrl}
                title={item.name}
                className="size-6"
              />
            </div>
            <div className="min-w-0 flex-grow px-2 py-1">
              {item.name ? (
                <div className="truncate text-[11px]">{item.name}</div>
              ) : null}
              <div className="text-center text-sm truncate">
                {numberWithCommaSeparator(item.quantity)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </EmptySection>
  )
}
