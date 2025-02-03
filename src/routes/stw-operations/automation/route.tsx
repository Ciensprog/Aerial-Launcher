import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'

import { AutomationStatusType } from '../../../config/constants/automation'

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
import { Switch } from '../../../components/ui/switch'

import { Route as RootRoute } from '../../__root'

import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'
import { useAutomationData } from './-hooks'

import { cn, parseCustomDisplayName } from '../../../lib/utils'
import { useTranslation } from 'react-i18next'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/automation',
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
                {t('stw-operations.options.auto-kick')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function StatusItem({
  status,
  title,
}: {
  status: AutomationStatusType
  title: string
}) {
  return (
    <span
      className={cn(
        'flex gap-2 items-center',
        'before:content-[""] before:block before:size-2 before:rounded-full',
        {
          'before:bg-green-600': status === AutomationStatusType.LISTENING,
          // 'before:bg-gray-600': status === AutomationStatusType.LOADING,
          'before:bg-gray-600':
            status === AutomationStatusType.DISCONNECTED,
          'before:bg-red-400': status === AutomationStatusType.ERROR,
          // 'before:bg-yellow-600': status === AutomationStatusType.ISSUE,
        }
      )}
    >
      {title}
    </span>
  )
}

export function Content() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const {
    accounts,
    accountSelectorIsDisabled,
    options,
    selectedAccounts,

    customFilter,
    // handleReloadAccount,
    handleRemoveAccount,
    handleUpdateClaimAction,
    onSelectItem,
  } = useAutomationData()
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  return (
    <div className="flex flex-grow">
      <div className="flex flex-col items-center justify-center w-full">
        <Card className="max-w-lg w-full">
          <CardHeader className="border-b">
            <CardDescription>
              {t('auto-kick.description1')}
            </CardDescription>
            <CardDescription>
              {t('auto-kick.description2')}
            </CardDescription>
            <CardDescription className="flex gap-2">
              <StatusItem
                status={AutomationStatusType.LISTENING}
                title={t('auto-kick.statuses.listening')}
              />
              {/* <StatusItem
                status={AutomationStatusType.ISSUE}
                title="Issue"
              /> */}
              <StatusItem
                status={AutomationStatusType.ERROR}
                title={t('auto-kick.statuses.credential-error')}
              />
              <StatusItem
                status={AutomationStatusType.DISCONNECTED}
                title={t('auto-kick.statuses.disconnected')}
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
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
                    total: options.length,
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

        <div className="gap-4 grid grid-cols-2 max-w-lg mt-5 w-full">
          {accounts.map((account) => {
            const current = selectedAccounts[account.accountId]
            const isLoading =
              current.status === null ||
              current.status === AutomationStatusType.LOADING ||
              current.submittings.removing
            const disabledActions =
              current.submittings.connecting ||
              current.submittings.removing ||
              isLoading
            const isDisconnected =
              current.status === AutomationStatusType.DISCONNECTED
            const isError = current.status === AutomationStatusType.ERROR
            const isListening =
              current.status === AutomationStatusType.LISTENING

            return (
              <article
                className="border rounded"
                key={account.accountId}
              >
                <div className="bg-muted-foreground/5 flex items-center min-h-8 px-0.5 py-0.5 text-center text-muted-foreground text-xs">
                  <span
                    className={cn(
                      'flex gap-1.5 items-center px-2 truncate',
                      {
                        'before:content-[""] before:block before:size-2 before:rounded-full':
                          current.status !==
                            AutomationStatusType.LOADING &&
                          current.status !== null,
                        'before:bg-green-600': isListening,
                        // 'before:bg-gray-600':
                        //   current.status === AutomationStatusType.LOADING,
                        'before:bg-gray-600': isDisconnected,
                        'before:bg-red-400': isError,
                        // 'before:bg-yellow-600':
                        //   current.status === AutomationStatusType.ISSUE,
                      }
                    )}
                  >
                    {parseCustomDisplayName(account)}
                  </span>
                  <div className="ml-auto">
                    <Button
                      type="button"
                      size="icon"
                      className={cn('px-0 size-8', {
                        'text-[#ff6868]/60 [&:not(:disabled)]:hover:text-[#ff6868]':
                          !isLoading,
                      })}
                      variant="ghost"
                      onClick={
                        !isLoading
                          ? handleRemoveAccount(account.accountId)
                          : undefined
                      }
                      disabled={disabledActions}
                    >
                      {isLoading ? (
                        <UpdateIcon className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 px-3 py-2 text-sm">
                  <div className="flex flex-grow items-center justify-between">
                    <span>{t('auto-kick.options.kick')}</span>
                    <Switch
                      checked={current.actions.kick}
                      onCheckedChange={
                        !isLoading
                          ? handleUpdateClaimAction(
                              'kick',
                              account.accountId
                            )
                          : undefined
                      }
                      disabled={disabledActions}
                    />
                  </div>
                  <div className="flex flex-grow items-center justify-between">
                    <span>{t('auto-kick.options.claim')}</span>
                    <Switch
                      checked={current.actions.claim}
                      onCheckedChange={
                        !isLoading
                          ? handleUpdateClaimAction(
                              'claim',
                              account.accountId
                            )
                          : undefined
                      }
                      disabled={disabledActions}
                    />
                  </div>
                  <div className="flex flex-grow items-center justify-between">
                    <span>{t('auto-kick.options.transfer-mats')}</span>
                    <Switch
                      checked={current.actions.transferMats}
                      onCheckedChange={
                        !isLoading
                          ? handleUpdateClaimAction(
                              'transferMats',
                              account.accountId
                            )
                          : undefined
                      }
                      disabled={disabledActions}
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
