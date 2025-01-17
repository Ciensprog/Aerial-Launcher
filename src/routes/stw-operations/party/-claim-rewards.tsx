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
    <Card className="flex flex-col flex-shrink-0 h-36 justify-center max-w-52 w-full">
      <CardContent className="block pt-6 space-y-4">
        <div className="flex flex-col gap-4">
          <Combobox
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
            className="px-0.5 w-full"
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
        </div>
      </CardContent>
    </Card>
  )
}
