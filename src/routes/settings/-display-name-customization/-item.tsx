import type { AccountData } from '../../../types/accounts'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

import { useActions, useInputField } from './-hooks'

export function AccountItem({
  account,
  isPending,
  onSubmit,
}: {
  account: AccountData
} & Pick<ReturnType<typeof useActions>, 'isPending' | 'onSubmit'>) {
  const { onChangeInputValue, value } = useInputField({
    defaultValue: account.customDisplayName,
  })

  return (
    <form
      className="flex items-center overflow-hidden relative rounded-md"
      onSubmit={onSubmit({
        account,
        value,
      })}
    >
      <Input
        className="pr-20"
        placeholder={account.displayName}
        value={value}
        onChange={onChangeInputValue}
        disabled={isPending}
      />
      <Button
        type="submit"
        variant="secondary"
        className="absolute h-8 px-2 right-1 w-auto z-20 disabled:cursor-not-allowed disabled:pointer-events-auto"
        disabled={isPending}
      >
        Change
      </Button>
    </form>
  )
}
