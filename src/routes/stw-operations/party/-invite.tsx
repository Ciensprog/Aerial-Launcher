import { Combobox } from '../../../components/ui/extended/combobox'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
} from '../../../components/ui/card'

import { useInviteFriendsForm } from '../../../hooks/stw-operations/party'
import { useComboboxAccounts } from './-hooks'
import { BellRing } from 'lucide-react'

import { useGetSelectedAccount } from '../../../hooks/accounts'

import { parseCustomDisplayName } from '../../../lib/utils'

export function InviteCard() {
  const { selected } = useGetSelectedAccount()
  const { setValue, value } = useInviteFriendsForm()
  const { customFilter, hasValues, options } = useComboboxAccounts({
    value,
  })

  return (
    <Card className="max-w-lg w-full">
      <CardContent className="grid gap-2 pt-6">
        <CardDescription>
          Account selected:{' '}
          <span className="font-bold">
            {parseCustomDisplayName(selected)}
          </span>
        </CardDescription>
        <div className="flex gap-4">
          <Combobox
            placeholder="Select friends"
            placeholderSearch="Recently invited players"
            emptyText="No friend found"
            options={options}
            value={value}
            customFilter={customFilter}
            onChange={setValue}
            isMulti
            showNames
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
        <Alert className="border-none pb-0">
          <BellRing className="h-4 stroke-muted-foreground w-4" />
          <AlertDescription className="text-muted-foreground text-xs">
            If the invited player is not your friend, the launcher will
            automatically send him a friend request.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
