import { createRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

import { Combobox } from '../../../components/ui/extended/combobox'
import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
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
import { Switch } from '../../../components/ui/switch'

import { Route as RootRoute } from '../../__root'

import { useAutoLlamaData } from '../../../hooks/stw-operations/auto-llamas'
import { useGetComboboxAccounts } from '../../../hooks/accounts'
import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'

import { cn, parseCustomDisplayName } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/auto-llamas',
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
                {t('stw-operations.options.auto-llamas')}
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
  const { t } = useTranslation(['stw-operations'])

  const {
    isAllEnabled,
    isDisableBuyButtonDisabled,
    selected,

    handleAddAllAccounts,
    handleRemoveAccount,
    handleRemoveAllAccounts,
    handleUpdateAccounts,
    handleDisableBuy,
    handleEnableBuy,
    onSelectItem,
  } = useAutoLlamaData()
  const {
    accountSelectorIsDisabled,
    accounts,
    options,
    selectedAccounts,
    customFilter,
  } = useGetComboboxAccounts({
    selected,
  })
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  return (
    <div className="flex flex-grow">
      <div className="flex flex-col items-center justify-center w-full">
        <Card className="max-w-lg w-full">
          <CardHeader className="border-b">
            <CardDescription>{t('llamas.description1')}</CardDescription>
            <CardDescription>
              <Trans
                ns="stw-operations"
                i18nKey="llamas.note1"
              >
                <sup>1</sup> You can also enable the purchase of an upgrade
                llama (50 V-Bucks) if you want. This purchase will only be
                made if there's at least one legendary or mythic survivor
              </Trans>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <Combobox
              className="max-w-full"
              emptyPlaceholder={t('form.accounts.no-options', {
                ns: 'general',
              })}
              emptyContent={t('form.accounts.search-empty', {
                ns: 'general',
              })}
              placeholder={t('form.accounts.select', {
                ns: 'general',
              })}
              placeholderSearch={t('form.accounts.placeholder', {
                ns: 'general',
                context: !getMenuOptionVisibility('showTotalAccounts')
                  ? 'private'
                  : undefined,
                total: 0,
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
            />
            <div className="gap-2 grid grid-cols-2">
              <Button
                className="leading-4 text-balance truncate"
                variant="secondary"
                onClick={() =>
                  handleAddAllAccounts(options.map((item) => item.value))
                }
                disabled={
                  options.length <= 0 ? true : accountSelectorIsDisabled
                }
              >
                {t('llamas.form.actions.buttons.add.accounts')}
              </Button>
              <Button
                className="leading-4 text-balance truncate"
                variant="outline"
                onClick={handleRemoveAllAccounts}
                disabled={accounts.length <= 0}
              >
                {t('llamas.form.actions.buttons.remove.accounts')}
              </Button>
              <Button
                className="leading-4 text-balance truncate"
                variant="secondary"
                onClick={handleEnableBuy}
                disabled={accounts.length <= 0 || isAllEnabled}
              >
                {t('llamas.form.actions.buttons.enable.buy')}
              </Button>
              <Button
                className="leading-4 text-balance truncate"
                variant="outline"
                onClick={handleDisableBuy}
                disabled={
                  accounts.length <= 0 || isDisableBuyButtonDisabled
                }
              >
                {t('llamas.form.actions.buttons.disable.buy')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="gap-4 grid grid-cols-2 max-w-lg mt-5 w-full">
          {accounts.map((account) => {
            const current = selectedAccounts[account.accountId]

            return (
              <article
                className="border rounded"
                key={account.accountId}
              >
                <div className="bg-muted-foreground/5 flex items-center min-h-8 px-0.5 py-0.5 text-center text-muted-foreground text-xs">
                  <span className="px-2 truncate">
                    {parseCustomDisplayName(account)}
                  </span>
                  <div className="ml-auto">
                    <Button
                      type="button"
                      size="icon"
                      className={cn('px-0 size-8', {
                        'text-[#ff6868]/60 [&:not(:disabled)]:hover:text-[#ff6868]':
                          !false,
                      })}
                      variant="ghost"
                      onClick={handleRemoveAccount(account.accountId)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 px-3 py-2 text-sm">
                  <div className="flex gap-2 items-center justify-between w-full">
                    <span>
                      <Trans
                        ns="stw-operations"
                        i18nKey="llamas.results.features.survivors"
                      >
                        Buy survivor
                        <sup className="text-muted-foreground">1</sup>
                      </Trans>
                    </span>
                    <Switch
                      checked={current.actions.survivors}
                      onCheckedChange={(value) =>
                        handleUpdateAccounts({
                          [current.accountId]: {
                            accountId: current.accountId,
                            config: {
                              type: 'survivors',
                              value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
