import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'

import { useComboboxAccounts } from './-hooks'

export function InviteCard() {
  const { customFilter, hasValues, options, setValue, value } =
    useComboboxAccounts()

  return (
    <Card className="max-w-lg w-full">
      <CardContent className="grid gap-4 pt-6">
        <div className="flex gap-4">
          <Combobox
            placeholder="Select friends"
            placeholderSearch={`Search on ${options.length} friends`}
            emptyText="No friend found"
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
            Invite
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
