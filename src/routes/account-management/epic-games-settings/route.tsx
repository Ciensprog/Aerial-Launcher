import { createRoute } from '@tanstack/react-router'
import { Trans, useTranslation } from 'react-i18next'

import { Route as RootRoute } from '../../__root'

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

import { useGetSelectedAccount } from '../../../hooks/accounts'
import { useHandlers } from './-actions'

import { parseCustomDisplayName } from '../../../lib/utils'

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
  const { handleOpenURL } = useHandlers()

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
                  {parseCustomDisplayName(selected)}
                </span>
              </Trans>
            </CardDescription>
          </CardContent>
          <CardFooter className="space-x-6">
            <Button
              className="w-full"
              onClick={handleOpenURL}
            >
              {t('epic-settings.form.submit-button')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
