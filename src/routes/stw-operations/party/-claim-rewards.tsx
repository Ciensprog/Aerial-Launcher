import { UpdateIcon } from '@radix-ui/react-icons'

import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'

import { useClaimRewardsForm } from '../../../hooks/stw-operations/party'
import { useClaimActions, useComboboxAccounts } from './-hooks'

import { cn } from '../../../lib/utils'

export function ClaimRewardsCard() {
  const { setValue, value } = useClaimRewardsForm()
  const { customFilter, hasValues, options } = useComboboxAccounts({
    value,
  })
  const { isPending, onClaim } = useClaimActions({
    value,
  })

  return (
    <Card className="flex flex-col flex-shrink-0 h-36 justify-center max-w-52 w-full">
      <CardContent className="block pt-6 space-y-4">
        <div className="flex flex-col gap-4">
          <Combobox
            placeholder="Select account"
            placeholderSearch={`Search on ${options.length} accounts`}
            emptyContent="No account found"
            options={options}
            value={value}
            customFilter={customFilter}
            onChange={setValue}
            isMulti
          />
          <Button
            className=""
            size="sm"
            onClick={onClaim}
            disabled={!hasValues}
          >
            <span className={cn('absolute', { hidden: !isPending })}>
              <UpdateIcon className="animate-spin" />
            </span>
            <span className={cn({ 'opacity-0 select-none': isPending })}>
              Claim Rewards
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
