import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { Clipboard, ExternalLinkIcon } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

import { epicGamesAccountSettingsURL } from '../../../config/fortnite/links'

import { Route as RootRoute } from '../../__root'

import { SeparatorWithTitle } from '../../../components/ui/extended/separator'
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
  CardFooter,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Separator } from '../../../components/ui/separator'

import { useGetSelectedAccount } from '../../../hooks/accounts'
import { useHandlers } from './-actions'

import { whatIsThis } from '../../../lib/callbacks'
import { cn, parseCustomDisplayName } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/account-management/epic-games-settings',
  component: () => {
    const { t } = useTranslation(['sidebar'], {
      keyPrefix: 'account-management',
    })

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('options.epic-settings')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['account-management'])

  const { selected } = useGetSelectedAccount()
  const {
    currentCode,
    isLoading,
    handleGenerateCode,
    handleOpenURL,
    handleCopyCode,
  } = useHandlers()

  const settingsUrl = currentCode
    ? epicGamesAccountSettingsURL(currentCode)
    : undefined

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <Card className="max-w-sm w-full">
          <CardContent className="grid gap-4 pt-6">
            <CardDescription>
              <Trans
                ns="general"
                i18nKey="account-selected"
                values={{
                  name: parseCustomDisplayName(selected),
                }}
              >
                Account selected:{' '}
                <span className="font-bold">
                  {parseCustomDisplayName(selected)}s
                </span>
              </Trans>
            </CardDescription>
            <Button
              className="w-full"
              onClick={handleGenerateCode}
            >
              {isLoading ? (
                <UpdateIcon className="animate-spin" />
              ) : (
                t('epic-settings.form.generate-button')
              )}
            </Button>
          </CardContent>

          <Separator />

          <CardFooter className="flex-col mt-6 space-y-6">
            <div
              className={cn(
                'flex items-center relative rounded-md w-full'
              )}
            >
              <Input
                type="text"
                className={cn('pr-10 select-none')}
                defaultValue={settingsUrl}
                disabled={settingsUrl === undefined}
                readOnly
              />
              <Button
                type="button"
                className={cn('absolute p-0 right-1 size-8 z-20')}
                variant="ghost"
                onClick={handleCopyCode}
                disabled={settingsUrl === undefined}
              >
                <Clipboard size={16} />
              </Button>
            </div>

            <SeparatorWithTitle>
              {t('separators.or', {
                ns: 'general',
              })}
            </SeparatorWithTitle>

            <Button
              className={cn('space-x-1 w-full', {
                'bg-secondary/80 cursor-not-allowed opacity-50':
                  settingsUrl === undefined,
              })}
              variant="secondary"
              asChild
            >
              <a
                href={settingsUrl}
                title={settingsUrl}
                onClick={handleOpenURL}
                onAuxClick={whatIsThis()}
              >
                <Trans
                  ns="account-management"
                  i18nKey="epic-settings.form.open-button"
                >
                  <span>Open Account Settings</span>
                  <ExternalLinkIcon size={16} />
                </Trans>
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
