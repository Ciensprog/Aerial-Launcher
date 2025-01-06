import { UpdateIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'

import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Switch } from '../../../components/ui/switch'

import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'
import { useKickAllPartyForm } from '../../../hooks/stw-operations/party'
import { useComboboxAccounts, useKickActions } from './-hooks'

import { cn } from '../../../lib/utils'

export function KickAllPartyCard() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const { changeClaimState, claimState, setValue, value } =
    useKickAllPartyForm()
  const { customFilter, hasValues, options } = useComboboxAccounts({
    value,
  })
  const { isPending, onKick } = useKickActions({
    claimState,
    value,
    callbackName: 'notificationKick',
  })
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  return (
    <Card className="max-w-lg w-full">
      <CardContent className="grid gap-4 pt-6">
        <div className="flex items-center justify-between">
          {t('party.claim.title')}
          <Switch
            checked={claimState}
            onCheckedChange={changeClaimState}
            disabled={!hasValues}
          />
        </div>
        <div className="flex gap-4">
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
          />
          <Button
            className="relative"
            size="sm"
            onClick={onKick()}
            disabled={!hasValues}
          >
            <span className={cn('absolute', { hidden: !isPending })}>
              <UpdateIcon className="animate-spin" />
            </span>
            <span
              className={cn(
                'flex-shrink-0 leading-4 text-balance truncate w-[5.3125rem]',
                {
                  'opacity-0 select-none': isPending,
                }
              )}
            >
              {t('party.kick.form.submit-button')}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
