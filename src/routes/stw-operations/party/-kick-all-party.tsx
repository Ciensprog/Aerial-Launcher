import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Switch } from '../../../components/ui/switch'

import { useAccounts, useComboboxSelections } from './-hooks'

export function KickAllPartyCard() {
  const { options } = useAccounts()
  const { hasValues, setValue, value } = useComboboxSelections()

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
            onChange={setValue}
          />
          <Button
            className="disabled:cursor-not-allowed disabled:pointer-events-auto"
            size="sm"
            onClick={() => {}}
            disabled={!hasValues}
          >
            Kick All Party
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
