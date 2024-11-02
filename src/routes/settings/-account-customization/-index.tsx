import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { AccountItem } from './-item'

import { useGetTags } from '../../../hooks/tags'
import { useAccounts, useActions } from './-hooks'

import { tagsArrayToSelectOptions } from '../../../lib/utils'

export function AccountCustomization() {
  const { tagsArray } = useGetTags()
  const { accounts, accountsArray, onChangeSearchValue, searchValue } =
    useAccounts()
  const { isPendingSubmitCustomDisplayName, onSubmitCustomDisplayName } =
    useActions()

  const tags = tagsArrayToSelectOptions(tagsArray)

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardDescription>
          Sometimes you could need a specific display name for identifying
          an account. If you want, you can change the current display name
          with a custom name.
        </CardDescription>
        <CardDescription className="text-muted-foreground/60">
          Note: this only applies visually to the launcher accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6">
        {accountsArray.length > 1 && (
          <div className="mb-5">
            <Input
              className="pr-20"
              placeholder={`Search on ${accountsArray.length} accounts...`}
              value={searchValue}
              onChange={onChangeSearchValue}
            />
          </div>
        )}
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <AccountItem
              tags={tags}
              account={account}
              isPendingSubmitCustomDisplayName={
                isPendingSubmitCustomDisplayName
              }
              onSubmitCustomDisplayName={onSubmitCustomDisplayName}
              key={account.accountId}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground">
            No account found
          </div>
        )}
      </CardContent>
    </Card>
  )
}
