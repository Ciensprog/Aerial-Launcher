import { UpdateIcon } from '@radix-ui/react-icons'
import { BellRing, Trash2 } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

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

import { useGetSelectedAccount } from '../../../hooks/accounts'

import { parseCustomDisplayName } from '../../../lib/utils'

export function InviteCard() {
  const { t } = useTranslation(['stw-operations', 'general'])

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
    handleRemoveFriend,
    setInputSearchValue,
  } = useInviteActions({
    selected,
  })

  return (
    <Card className="max-w-lg w-full">
      <CardContent className="grid gap-2 pt-6">
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
          <Combobox
            classNamePopoverContent="max-w-60"
            emptyPlaceholder={t(
              'party.friends.form.select.empty.placeholder'
            )}
            emptyOptions={t('party.friends.form.select.empty.options')}
            placeholder={t('party.friends.form.select.placeholder')}
            placeholderSearch={t(
              'party.friends.form.select.search.placeholder'
            )}
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
                      {t('actions.add', {
                        ns: 'general',
                      })}
                      <span className="max-w-32 ml-1.5 truncate">
                        {displayName.trim()}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}
            customItem={({ renderItem, item }) => {
              return (
                <div
                  className="flex gap-2 items-center"
                  key={item.value}
                >
                  {renderItem({
                    className: 'flex-grow',
                    classNameTitle: 'max-w-[9rem]',
                  })}
                  <Button
                    className="flex-shrink-0 size-8 text-[#ff6868]/60 hover:!text-[#ff6868]"
                    size="icon"
                    variant="ghost"
                    onClick={handleRemoveFriend({
                      accountId: item.value,
                      displayName: item.label,
                    })}
                    disabled={isSubmitting}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              )
            }}
            disabled={!selected}
            disabledItem={isSubmitting}
            inputSearchIsDisabled={isSubmitting}
            doNotDisableIfThereAreNoOptions
            isMulti
            showNames
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
