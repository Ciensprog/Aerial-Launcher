import type {
  SelectCustomFilter,
  SelectOption,
} from '../../ui/third-party/extended/input-tags'

import { Info } from 'lucide-react'

import { BulkTags, getBulkTags } from '../../../config/constants/tags'

import { SeparatorWithTitle } from '../../ui/extended/separator'
import { InputTags } from '../../ui/third-party/extended/input-tags'

import { useAccountsInputTagsCustomFilter } from './hooks'

export function AccountSelectors({
  accounts,
  customFilters,
  isDisabled,
  tags,
  onUpdateAccounts,
  onUpdateTags,
}: {
  accounts: {
    options: Array<SelectOption>
    value: Array<SelectOption>
  }
  customFilters?: Partial<{
    accounts: SelectCustomFilter
    tags: SelectCustomFilter
  }>
  isDisabled?: boolean
  tags: {
    options: Array<SelectOption>
    value: Array<SelectOption>
  }
  onUpdateAccounts?: (value: Array<SelectOption>) => void
  onUpdateTags?: (value: Array<SelectOption>) => void
}) {
  const { filter } = useAccountsInputTagsCustomFilter()

  const bulkTags = getBulkTags()
  const includeBulkTags = tags.value
    .map(({ value }) => value.trim().toLowerCase())
    .some((tag) => bulkTags.includes(tag as BulkTags))

  return (
    <div className="grid gap-4">
      <InputTags
        placeholder="Select some accounts..."
        options={accounts.options}
        value={accounts.value}
        onChange={onUpdateAccounts ?? (() => {})}
        isDisabled={isDisabled}
        customFilter={customFilters?.accounts ?? filter}
      />
      <SeparatorWithTitle>Or</SeparatorWithTitle>
      <div>
        {includeBulkTags && (
          <div className="flex gap-1 items-center mb-1.5 px-1 text-muted-foreground text-xs">
            <Info className="flex-shrink-0 relative size-3.5 top-[1px]" />
            Bulk tag selected, all launcher accounts will be used.
          </div>
        )}
        <InputTags
          placeholder="Select some tags..."
          options={tags.options}
          value={tags.value}
          onChange={onUpdateTags ?? (() => {})}
          isDisabled={isDisabled}
          customFilter={customFilters?.tags}
        />
      </div>
    </div>
  )
}
