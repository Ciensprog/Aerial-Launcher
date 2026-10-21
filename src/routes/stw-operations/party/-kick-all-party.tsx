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
    <Card className="w-full">
      <CardContent className="grid grid-cols-[8.5rem_auto_minmax(0,1fr)_8rem] items-center gap-2 p-2 pt-2">
        <span className="text-xs leading-tight">
          {t('party.claim.title')}
        </span>
        <Switch
          checked={claimState}
          onCheckedChange={changeClaimState}
          disabled={!hasValues}
        />
        <Combobox
          className="h-8 min-w-0 w-full"
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
          className="relative h-8 w-full px-2"
          size="sm"
          onClick={onKick()}
          disabled={!hasValues}
        >
          <span className={cn('absolute', { hidden: !isPending })}>
            <UpdateIcon className="animate-spin" />
          </span>
          <span
            className={cn('whitespace-nowrap leading-4', {
              'opacity-0 select-none': isPending,
            })}
          >
            {t('party.kick.form.submit-button')}
          </span>
        </Button>
      </CardContent>
    </Card>
  )
}
