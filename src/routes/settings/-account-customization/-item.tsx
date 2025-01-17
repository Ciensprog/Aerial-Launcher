import type { SelectOption } from '../../../components/ui/third-party/extended/input-tags'
import type { AccountData } from '../../../types/accounts'

import { useTranslation } from 'react-i18next'

import { InputTags } from '../../../components/ui/third-party/extended/input-tags'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

import { useInputPaddingButton } from '../../../hooks/ui/inputs'
import {
  useActions,
  useDisplayNameInputField,
  useTagsInputField,
} from './-hooks'

export function AccountItem({
  account,
  isPendingSubmitCustomDisplayName,
  tags,
  onSubmitCustomDisplayName,
}: {
  account: AccountData
  tags: Array<SelectOption>
} & ReturnType<typeof useActions>) {
  const { t } = useTranslation(['general'])

  const { customDisplayName, onChangeInputDisplayNameValue } =
    useDisplayNameInputField({
      defaultValue: account.customDisplayName,
    })
  const { currentTags, onChangeInputTagsValue } = useTagsInputField({
    account,
  })

  const [$updateInput, $updateButton] = useInputPaddingButton()

  return (
    <div className="flex flex-col flex-grow gap-1">
      <form
        className="flex items-center relative rounded-md"
        onSubmit={onSubmitCustomDisplayName({
          account,
          value: customDisplayName,
        })}
      >
        <Input
          className="pr-[var(--pr-button-width)]"
          placeholder={account.displayName}
          value={customDisplayName}
          onChange={onChangeInputDisplayNameValue}
          disabled={isPendingSubmitCustomDisplayName}
          ref={$updateInput}
        />
        <Button
          type="submit"
          variant="secondary"
          className="absolute h-8 px-2 right-1 w-auto"
          disabled={isPendingSubmitCustomDisplayName}
          ref={$updateButton}
        >
          {t('actions.change')}
        </Button>
      </form>

      <InputTags
        placeholder="Select some tags..."
        options={tags}
        value={currentTags}
        onChange={onChangeInputTagsValue}
      />
    </div>
  )
}
