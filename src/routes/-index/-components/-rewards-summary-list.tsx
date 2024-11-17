import { EmptySection } from './-empty'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'

export function RewardsSummaryList({
  rewards,
}: {
  rewards: Record<
    string,
    {
      imageUrl: string
      quantity: number
    }
  >
}) {
  return (
    <EmptySection
      total={Object.entries(rewards).length}
      title="No available rewards"
    >
      <ul className="gap-1 grid grid-cols-4">
        {Object.entries(rewards).map(([itemId, item]) => (
          <li
            className="border flex items-center rounded"
            key={itemId}
          >
            <div className="bg-muted-foreground/10 flex flex-shrink-0 h-8 items-center justify-center w-9">
              <img
                src={item.imageUrl}
                className="size-6"
              />
            </div>
            <div className="flex-grow px-2 text-center text-sm truncate">
              {numberWithCommaSeparator(item.quantity)}
            </div>
          </li>
        ))}
      </ul>
    </EmptySection>
  )
}
