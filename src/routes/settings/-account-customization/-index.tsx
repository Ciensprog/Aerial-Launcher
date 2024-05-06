import { Separator } from '../../../components/ui/extended/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'

import { AccountItem } from './-item'
import { useAccounts, useActions } from './-hooks'

export function AccountCustomization() {
  const { accounts, accountsArray, onChangeSearchValue, searchValue } =
    useAccounts()
  const { isPendingSubmitCustomDisplayName, onSubmitCustomDisplayName } =
    useActions()

  return (
    <>
      <Separator>Display Name Customization</Separator>

      <Card className="w-full">
        <CardHeader className="border-b">
          <CardDescription>
            Sometimes you could need a specific display name for
            identifying an account. If you want, you can change the current
            display name with a custom name.
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
    </>
  )
}
