import type {
  SelectCustomFilter,
  SelectOption,
} from '../../ui/third-party/extended/input-tags'

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
      <InputTags
        placeholder="Select some tags..."
        options={tags.options}
        value={tags.value}
        onChange={onUpdateTags ?? (() => {})}
        isDisabled={isDisabled}
        customFilter={customFilters?.tags}
      />
    </div>
  )
}
