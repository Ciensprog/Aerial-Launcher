import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'

import { useClaimRewardsForm } from '../../../hooks/stw-operations/party'
import { useComboboxAccounts } from './-hooks'

export function ClaimRewardsCard() {
  const { setValue, value } = useClaimRewardsForm()
  const { customFilter, hasValues, options } = useComboboxAccounts({
    value,
  })

  return (
    <Card className="flex flex-col flex-shrink-0 h-36 justify-center max-w-52 w-full">
      <CardContent className="block pt-6 space-y-4">
        <div className="flex flex-col gap-4">
          <Combobox
            placeholder="Select account"
            placeholderSearch={`Search on ${options.length} accounts`}
            emptyText="No account found"
            options={options}
            value={value}
            customFilter={customFilter}
            onChange={setValue}
            isMulti
          />
          <Button
            className="disabled:cursor-not-allowed disabled:pointer-events-auto"
            size="sm"
            onClick={() => {}}
            disabled={!hasValues}
          >
            Claim Rewards
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
