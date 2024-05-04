import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Separator } from '../../../components/ui/separator'

import { useAccounts, useActions } from './-hooks'
import { AccountItem } from './-item'

export function DisplayNameCustomization() {
  const { accounts, accountsArray, onChangeSearchValue, searchValue } =
    useAccounts()
  const { isPending, onSubmit } = useActions()

  return (
    <>
      <Separator className="flex justify-center relative">
        <div className="absolute bg-background font-semibold px-1.5 text-muted-foreground text-sm -top-2.5">
          Display Name Customization
        </div>
      </Separator>

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
                onSubmit={onSubmit}
                isPending={isPending}
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
