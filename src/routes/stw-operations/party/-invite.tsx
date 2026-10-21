import { UpdateIcon } from '@radix-ui/react-icons'
import { BellRing } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

import { Alert, AlertDescription } from '../../../components/ui/alert'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
} from '../../../components/ui/card'

import { useInviteFriendsForm } from '../../../hooks/stw-operations/party'
import { useInviteActions } from './-hooks'
import { FriendsPicker } from './-friends-picker'

import { useGetSelectedAccount } from '../../../hooks/accounts'

import { parseCustomDisplayName } from '../../../lib/utils'

export function InviteCard() {
  const { t } = useTranslation(['stw-operations', 'general'])
  const { selected } = useGetSelectedAccount()
  const { hasValues, setValue, value } = useInviteFriendsForm()
  const actions = useInviteActions({
    selected,
  })
  const { isInviting, handleInvite } = actions

  return (
    <Card className="w-full">
      <CardContent className="grid gap-2 p-3 pt-3">
        <CardDescription className="font-medium text-foreground">
          {t('party.friends.form.title')}
        </CardDescription>
        <CardDescription>
          <Trans
            ns="general"
            i18nKey="account-selected"
            values={{
              name: parseCustomDisplayName(selected),
            }}
          >
            Account selected:{' '}
            <span className="font-bold">
              {parseCustomDisplayName(selected)}
            </span>
          </Trans>
        </CardDescription>
        <div className="flex gap-4">
          <FriendsPicker
            selected={selected}
            value={value}
            setValue={setValue}
            actions={actions}
          />
          <Button
            className="flex-shrink-0 px-0.5 w-16"
            size="sm"
            onClick={handleInvite(value)}
            disabled={!selected || !hasValues || isInviting}
          >
            {isInviting ? (
              <UpdateIcon className="animate-spin" />
            ) : (
              <span className="truncate">
                {t('party.friends.form.submit-button')}
              </span>
            )}
          </Button>
        </div>
        <Alert className="border-none pb-0">
          <BellRing className="h-4 stroke-muted-foreground w-4" />
          <AlertDescription className="text-muted-foreground text-xs">
            {t('party.friends.note')}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
