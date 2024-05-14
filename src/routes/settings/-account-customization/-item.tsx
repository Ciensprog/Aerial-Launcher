import type { AccountData } from '../../../types/accounts'

import {
  type SelectOption,
  InputTags,
} from '../../../components/ui/third-party/extended/input-tags'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

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
  const { customDisplayName, onChangeInputDisplayNameValue } =
    useDisplayNameInputField({
      defaultValue: account.customDisplayName,
    })
  const { currentTags, onChangeInputTagsValue } = useTagsInputField({
    account,
  })

  return (
    <div className="flex flex-col gap-1">
      <form
        className="flex items-center relative rounded-md"
        onSubmit={onSubmitCustomDisplayName({
          account,
          value: customDisplayName,
        })}
      >
        <Input
          className="pr-20"
          placeholder={account.displayName}
          value={customDisplayName}
          onChange={onChangeInputDisplayNameValue}
          disabled={isPendingSubmitCustomDisplayName}
        />
        <Button
          type="submit"
          variant="secondary"
          className="absolute h-8 px-2 right-1 w-auto disabled:cursor-not-allowed disabled:pointer-events-auto"
          disabled={isPendingSubmitCustomDisplayName}
        >
          Change
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
