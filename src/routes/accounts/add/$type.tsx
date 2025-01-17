import { createRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'

import { AuthorizationCodePage } from './(authorization-code)/-page'
import { DeviceAuthPage } from './(device-auth)/-page'
import { ExchangeCodePage } from './(exchange-code)/-page'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/accounts/add/$type',
  component: ComponentRoute,
})

function ComponentRoute() {
  const { t, i18n } = useTranslation(['accounts', 'sidebar'])

  const { type } = Route.useParams()
  const availableTypes = useMemo(
    () => ({
      'authorization-code': {
        component: <AuthorizationCodePage />,
        title: t('accounts.options.auth', {
          ns: 'sidebar',
        }),
      },
      'exchange-code': {
        component: <ExchangeCodePage />,
        title: t('accounts.options.exchange', {
          ns: 'sidebar',
        }),
      },
      'device-auth': {
        component: <DeviceAuthPage />,
        title: t('accounts.options.device', {
          ns: 'sidebar',
        }),
      },
    }),
    [i18n.language]
  )

  const currentType = availableTypes[type as keyof typeof availableTypes]

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <HomeBreadcrumb />
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {t('accounts.title', {
                ns: 'sidebar',
              })}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentType.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-grow">
        <div className="flex items-center justify-center w-full">
          {currentType.component}
        </div>
      </div>
    </>
  )
}
