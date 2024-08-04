import { UpdateIcon } from '@radix-ui/react-icons'

import { Combobox } from '../../../components/ui/extended/combobox'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
} from '../../../components/ui/card'

import { useInviteFriendsForm } from '../../../hooks/stw-operations/party'
import { useInviteActions } from './-hooks'
import { BellRing } from 'lucide-react'

import { useGetSelectedAccount } from '../../../hooks/accounts'

import { parseCustomDisplayName } from '../../../lib/utils'

export function InviteCard() {
  const { selected } = useGetSelectedAccount()
  const { hasValues, setValue, value } = useInviteFriendsForm()
  const {
    friendOptions,
    inputSearchValue,
    isInviting,
    isSubmitting,

    customFilter,
    handleAddNewFriend,
    handleInvite,
    setInputSearchValue,
  } = useInviteActions({
    selected,
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
            emptyPlaceholder="No friends"
            emptyOptions="Type to add them to the list"
            placeholder="Select friends"
            placeholderSearch="Invite people"
            options={friendOptions}
            inputSearchValue={inputSearchValue}
            value={value}
            customFilter={customFilter}
            onInputSearchChange={setInputSearchValue}
            onChange={setValue}
            emptyContentClassname="p-1"
            emptyContent={(displayName) => (
              <div>
                <Button
                  variant="ghost"
                  className="h-[39px] w-full"
                  onClick={handleAddNewFriend(displayName)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <UpdateIcon className="animate-spin" />
                  ) : (
                    <>
                      Add
                      <span className="max-w-32 ml-1.5 truncate">
                        {displayName.trim()}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}
            disabled={!selected}
            inputSearchIsDisabled={isSubmitting}
            doNotDisableIfThereAreNoOptions
            isMulti
            showNames
          />
          <Button
            className="w-16"
            size="sm"
            onClick={handleInvite(value)}
            disabled={!selected || !hasValues || isInviting}
          >
            {isInviting ? (
              <UpdateIcon className="animate-spin" />
            ) : (
              'Invite'
            )}
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
