import type {
  SelectCustomFilter,
  SelectOption,
} from '../../ui/third-party/extended/input-tags'

import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { BulkTags, getBulkTags } from '../../../config/constants/tags'
import { cn } from '../../../lib/utils'

import { SeparatorWithTitle } from '../../ui/extended/separator'
import { InputTags } from '../../ui/third-party/extended/input-tags'

import { useAccountsInputTagsCustomFilter } from './hooks'

export function AccountSelectors({
  accounts,
  accountsPlaceholder,
  className,
  customFilters,
  isDisabled,
  hideTags = false,
  layout = 'stack',
  tags,
  onUpdateAccounts,
  onUpdateTags,
}: {
  accounts: {
    options: Array<SelectOption>
    value: Array<SelectOption>
  }
  accountsPlaceholder?: string
  className?: string
  customFilters?: Partial<{
    accounts: SelectCustomFilter
    tags: SelectCustomFilter
  }>
  isDisabled?: boolean
  hideTags?: boolean
  layout?: 'stack' | 'row'
  tags: {
    options: Array<SelectOption>
    value: Array<SelectOption>
  }
  onUpdateAccounts?: (value: Array<SelectOption>) => void
  onUpdateTags?: (value: Array<SelectOption>) => void
}) {
  const { t } = useTranslation(['general'])

  const { filter } = useAccountsInputTagsCustomFilter()

  const bulkTags = getBulkTags()
  const includeBulkTags = tags.value
    .map(({ value }) => value.trim().toLowerCase())
    .some((tag) => bulkTags.includes(tag as BulkTags))

  const accountsInput = (
    <InputTags
      placeholder={
        accountsPlaceholder ?? t('form.multi.select.accounts')
      }
      options={accounts.options}
      value={accounts.value}
      onChange={onUpdateAccounts ?? (() => {})}
      isDisabled={isDisabled}
      menuPortalTarget="select-portal-root"
      customFilter={customFilters?.accounts ?? filter}
    />
  )

  const tagsInput = (
    <div className="min-w-0">
      {includeBulkTags && (
        <div className="flex gap-1 items-center mb-1.5 px-1 text-muted-foreground text-xs">
          <Info className="flex-shrink-0 relative size-3.5 top-[1px]" />
          {t('form.multi.select.bulk-note')}
        </div>
      )}
      <InputTags
        placeholder={t('form.multi.select.tags')}
        options={tags.options}
        value={tags.value}
        onChange={onUpdateTags ?? (() => {})}
        isDisabled={isDisabled}
        menuPortalTarget="select-portal-root"
        customFilter={customFilters?.tags}
      />
    </div>
  )

  if (layout === 'row') {
    return (
      <div
        className={cn(
          'grid min-w-0 flex-1 gap-2',
          hideTags ? 'grid-cols-1' : 'grid-cols-2',
          className,
        )}
      >
        <div className="min-w-0">{accountsInput}</div>
        {hideTags ? null : tagsInput}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4', className)}>
      {accountsInput}
      {hideTags ? null : (
        <>
          <SeparatorWithTitle>{t('separators.or')}</SeparatorWithTitle>
          {tagsInput}
        </>
      )}
    </div>
  )
}
