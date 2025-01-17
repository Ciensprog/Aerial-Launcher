import { UpdateIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'

import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Switch } from '../../../components/ui/switch'

import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'
import { useLeavePartyForm } from '../../../hooks/stw-operations/party'
import { useComboboxAccounts, useKickActions } from './-hooks'

import { cn } from '../../../lib/utils'

export function LeavePartyCard() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const { changeClaimState, claimState, setValue, value } =
    useLeavePartyForm()
  const { customFilter, hasValues, options } = useComboboxAccounts({
    value,
  })
  const { isPending, onKick } = useKickActions({
    claimState,
    value,
    callbackName: 'notificationLeave',
  })
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  return (
    <Card className="flex flex-col flex-shrink-0 h-36 justify-center max-w-72 w-full">
      <CardContent className="block pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="pr-5">{t('party.claim.title')}</span>
          <Switch
            onCheckedChange={changeClaimState}
            checked={claimState}
            disabled={!hasValues}
          />
        </div>
        <div className="flex gap-4">
          <Combobox
            className="max-w-40"
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
            className="leading-none"
            size="sm"
            onClick={onKick(true)}
            disabled={!hasValues}
          >
            <span className={cn('absolute', { hidden: !isPending })}>
              <UpdateIcon className="animate-spin" />
            </span>
            <span
              className={cn('max-w-12 text-balance truncate', {
                'opacity-0 select-none': isPending,
              })}
            >
              {t('party.leave.form.submit-button')}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
