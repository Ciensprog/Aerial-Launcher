import { UpdateIcon } from '@radix-ui/react-icons'

import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Switch } from '../../../components/ui/switch'

import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'
import { useLeavePartyForm } from '../../../hooks/stw-operations/party'
import { useComboboxAccounts, useKickActions } from './-hooks'

import { cn } from '../../../lib/utils'

export function LeavePartyCard() {
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
          <span className="pr-5">Claim rewards after leaving mission</span>
          <Switch
            onCheckedChange={changeClaimState}
            checked={claimState}
            disabled={!hasValues}
          />
        </div>
        <div className="flex gap-4">
          <Combobox
            className="max-w-40"
            placeholder="Select account"
            placeholderSearch={
              getMenuOptionVisibility('showTotalAccounts')
                ? `Search on ${options.length} accounts`
                : 'Search on your accounts'
            }
            emptyContent="No account found"
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
            <span className={cn({ 'opacity-0 select-none': isPending })}>
              Leave
              <br />
              Party
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
