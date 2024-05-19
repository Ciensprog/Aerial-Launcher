import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'

import { useAccounts, useComboboxSelections } from './-hooks'

export function ClaimRewardsCard() {
  const { options } = useAccounts()
  const { hasValues, setValue, value } = useComboboxSelections()

  return (
    <Card className="flex-shrink-0 h-36 max-w-52 w-full">
      <CardContent className="block grid- gap-4 pt-6">
        <div className="flex flex-col gap-4">
          <Combobox
            placeholder="Select account"
            placeholderSearch={`Search on ${options.length} accounts`}
            emptyText="No account found"
            options={options}
            value={value}
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
