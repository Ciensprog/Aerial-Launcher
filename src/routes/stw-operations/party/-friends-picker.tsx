import { UpdateIcon } from '@radix-ui/react-icons'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Combobox } from '../../../components/ui/extended/combobox'
import { Button } from '../../../components/ui/button'

import { useInviteActions } from './-hooks'

import type { ComboboxOption } from '../../../components/ui/extended/combobox/hooks'
import type { AccountData } from '../../../types/accounts'

export type FriendsPickerProps = {
  selected: AccountData | null
  value: Array<ComboboxOption>
  setValue: (value: Array<ComboboxOption>) => void
  actions: ReturnType<typeof useInviteActions>
  placeholderSearch?: string
}

export function FriendsPicker({
  selected,
  value,
  setValue,
  actions,
  placeholderSearch,
}: FriendsPickerProps) {
  const { t } = useTranslation(['stw-operations', 'general'])
  const {
    friendOptions,
    friendsListVersion,
    isSubmitting,
    customFilter,
    handleAddNewFriend,
    handleRemoveFriend,
  } = actions
  const [inputSearchValue, setInputSearchValue] = useState('')

  useEffect(() => {
    setInputSearchValue('')
  }, [friendsListVersion])

  return (
    <Combobox
      classNamePopoverContent="max-w-60"
      emptyPlaceholder={t(
        'party.friends.form.select.empty.placeholder'
      )}
      emptyOptions={t('party.friends.form.select.empty.options')}
      placeholder={t('party.friends.form.select.placeholder')}
      placeholderSearch={
        placeholderSearch ??
        t('party.friends.form.select.search.placeholder')
      }
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
          <div className="flex gap-2 items-center" key={item.value}>
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
  )
}

export type FriendsActionCardProps = FriendsPickerProps & {
  hasValues: boolean
}
