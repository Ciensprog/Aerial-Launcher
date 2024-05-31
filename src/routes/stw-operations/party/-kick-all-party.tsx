import { UpdateIcon } from '@radix-ui/react-icons'

import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Switch } from '../../../components/ui/switch'

import { useComboboxAccounts, useKickActions } from './-hooks'

import { cn } from '../../../lib/utils'

export function KickAllPartyCard() {
  const { customFilter, hasValues, options, setValue, value } =
    useComboboxAccounts()
  const { isPending, onKick } = useKickActions({
    value,
    callbackName: 'notificationKick',
  })

  return (
    <Card className="max-w-lg w-full">
      <CardContent className="grid gap-4 pt-6">
        <div className="flex items-center justify-between">
          Claim rewards after leaving mission
          <Switch disabled={!hasValues} />
        </div>
        <div className="flex gap-4">
          <Combobox
            placeholder="Select account"
            placeholderSearch={`Search on ${options.length} accounts`}
            emptyText="No account found"
            options={options}
            value={value}
            customFilter={customFilter}
            onChange={setValue}
          />
          <Button
            className="relative disabled:cursor-not-allowed disabled:pointer-events-auto"
            size="sm"
            onClick={onKick()}
            disabled={!hasValues}
          >
            <span className={cn('absolute', { hidden: !isPending })}>
              <UpdateIcon className="animate-spin" />
            </span>
            <span className={cn({ 'opacity-0 select-none': isPending })}>
              Kick All Party
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
