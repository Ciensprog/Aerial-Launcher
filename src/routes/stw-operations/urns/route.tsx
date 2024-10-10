// import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { Combobox } from '../../../components/ui/extended/combobox'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'

import { Route as RootRoute } from '../../__root'

import { useData } from './-hooks'

import { parseCustomDisplayName } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/urns',
  component: () => (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <HomeBreadcrumb />
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>STW Operations</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Auto-pin Urns</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Content />
    </>
  ),
})

export function Content() {
  const {
    accounts,
    accountSelectorIsDisabled,
    options,
    selectedAccounts,
    selectedAccountsMiniBosses,

    customFilter,
    handleRemoveAccount,
    handleUpdateAccount,
    onSelectItem,
  } = useData()

  return (
    <div className="flex flex-grow">
      <div className="flex flex-col items-center justify-center w-full">
        <Card className="max-w-lg w-full">
          <CardHeader className="border-b">
            <CardDescription className="border-l-4 pl-2">
              <span className="font-bold">Note:</span> Only works during
              dungeon seasons.
            </CardDescription>
            <CardDescription>
              This feature will automatically pin "Urn Your Keep" quest
              every time it claims it (with the launcher). So you guys can
              always have track of the urns you are missing and don't
              bother pinning it before every run.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Combobox
                  className="max-w-full"
                  emptyPlaceholder="No accounts"
                  emptyContent="No account found"
                  placeholder="Select an account"
                  placeholderSearch={`Search on ${options.length} accounts`}
                  options={options}
                  value={[]}
                  customFilter={customFilter}
                  onChange={() => {}}
                  onSelectItem={onSelectItem}
                  emptyContentClassname="py-6 text-center text-sm"
                  disabled={accountSelectorIsDisabled}
                  disabledItem={accountSelectorIsDisabled}
                  inputSearchIsDisabled={accountSelectorIsDisabled}
                  hideInputSearchWhenOnlyOneOptionIsAvailable
                  hideSelectorOnSelectItem
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-lg mt-5 w-full">
          <ul className="gap-2 grid">
            {accounts.map((account) => {
              const value = selectedAccounts[account.accountId]
              const valueMiniBosses =
                selectedAccountsMiniBosses[account.accountId]

              return (
                <li
                  className="border flex gap-3 items-center px-3 py-2 rounded"
                  key={account.accountId}
                >
                  <div className="max-w-36 truncate">
                    {parseCustomDisplayName(account)}
                  </div>
                  <div className="flex gap-3 items-center ml-auto">
                    <Label htmlFor="switch-urns">Urns</Label>
                    <Switch
                      id="switch-urns"
                      checked={value}
                      onCheckedChange={handleUpdateAccount(
                        account.accountId,
                        'urns'
                      )}
                    />
                    <Label htmlFor="switch-mini-bosses">Mini-Bosses</Label>
                    <Switch
                      id="switch-mini-bosses"
                      checked={valueMiniBosses}
                      onCheckedChange={handleUpdateAccount(
                        account.accountId,
                        'mini-bosses'
                      )}
                    />
                    <div>
                      <Button
                        className="text-[#ff6868]/60 [&:not(:disabled)]:hover:text-[#ff6868]"
                        size="icon"
                        variant="ghost"
                        onClick={handleRemoveAccount(account.accountId)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
