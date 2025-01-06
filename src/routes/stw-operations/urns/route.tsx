// import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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

import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'
import { useData } from './-hooks'

import { parseCustomDisplayName } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/urns',
  component: () => {
    const { t } = useTranslation(['sidebar'])

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('stw-operations.title')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {t('stw-operations.options.auto-pin-urns')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

export function Content() {
  const { t } = useTranslation(['stw-operations', 'general'])

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
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  return (
    <div className="flex flex-grow">
      <div className="flex flex-col items-center justify-center w-full">
        <Card className="max-w-lg w-full">
          <CardHeader className="border-b">
            <CardDescription className="border-l-4 pl-2">
              {t('urns.note')}
            </CardDescription>
            <CardDescription>{t('urns.description')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Combobox
                  className="max-w-full"
                  placeholder={t('form.accounts.select', {
                    ns: 'general',
                  })}
                  placeholderSearch={t('form.accounts.placeholder', {
                    ns: 'general',
                    context: !getMenuOptionVisibility('showTotalAccounts')
                      ? 'private'
                      : undefined,
                    total: options.length,
                  })}
                  emptyPlaceholder={t('form.accounts.no-options', {
                    ns: 'general',
                  })}
                  emptyContent={t('form.accounts.search-empty', {
                    ns: 'general',
                  })}
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
                    <Label htmlFor="switch-urns">
                      {t('urns.options.urns')}
                    </Label>
                    <Switch
                      id="switch-urns"
                      checked={value}
                      onCheckedChange={handleUpdateAccount(
                        account.accountId,
                        'urns'
                      )}
                    />
                    <Label htmlFor="switch-mini-bosses">
                      {t('urns.options.mini-bosses')}
                    </Label>
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
