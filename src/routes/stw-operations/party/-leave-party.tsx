import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Switch } from '../../../components/ui/switch'

import { useComboboxAccounts } from './-hooks'

export function LeavePartyCard() {
  const { customFilter, hasValues, options, setValue, value } =
    useComboboxAccounts()

  return (
    <Card className="flex flex-col flex-shrink-0 h-36 justify-center max-w-72 w-full">
      <CardContent className="block pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="pr-5">Claim rewards after leaving mission</span>
          <Switch disabled={!hasValues} />
        </div>
        <div className="flex gap-4">
          <Combobox
            className="max-w-40"
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
            className="leading-none disabled:cursor-not-allowed disabled:pointer-events-auto"
            size="sm"
            onClick={() => {}}
            disabled={!hasValues}
          >
            Leave
            <br />
            Party
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
