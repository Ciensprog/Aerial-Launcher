import { UpdateIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'

import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'

import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'
import { useClaimRewardsForm } from '../../../hooks/stw-operations/party'
import { useClaimActions, useComboboxAccounts } from './-hooks'

import { cn } from '../../../lib/utils'

export function ClaimRewardsCard() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const { setValue, value } = useClaimRewardsForm()
  const { customFilter, hasValues, options } = useComboboxAccounts({
    value,
  })
  const { isPending, onClaim } = useClaimActions({
    value,
  })
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  return (
    <Card className="flex min-w-0 flex-1 flex-col justify-center">
      <CardContent className="flex flex-col gap-2 p-2 pt-2">
          <Combobox
            className="h-8"
            placeholder={t('form.accounts.select', {
              ns: 'general',
            })}
            placeholderSearch={t('form.accounts.placeholder', {
              ns: 'general',
              context: !getMenuOptionVisibility('showTotalAccounts')
                ? 'private'
                : undefined,
              total: options.length,
            })}
            emptyContent={t('form.accounts.search-empty', {
              ns: 'general',
            })}
            options={options}
            value={value}
            customFilter={customFilter}
            onChange={setValue}
            isMulti
          />
          <Button
            className="relative h-8 w-full px-0.5"
            size="sm"
            onClick={onClaim}
            disabled={!hasValues}
          >
            <span className={cn('absolute', { hidden: !isPending })}>
              <UpdateIcon className="animate-spin" />
            </span>
            <span
              className={cn(
                'flex-shrink-0 leading-4 text-balance truncate w-40',
                {
                  'opacity-0 select-none': isPending,
                }
              )}
            >
              {t('party.claim.form.submit-button')}
            </span>
          </Button>
      </CardContent>
    </Card>
  )
}
