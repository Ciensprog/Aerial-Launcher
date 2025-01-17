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
import { useHandleRemove } from './-actions'

import { parseCustomDisplayName } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/accounts/remove',
  component: () => {
    const { t } = useTranslation(['sidebar'], {
      keyPrefix: 'accounts',
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
              <BreadcrumbPage>{t('options.remove')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['accounts'], {
    keyPrefix: 'remove-account',
  })

  const { selected } = useGetSelectedAccount()
  const { handleRemove } = useHandleRemove()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <Card className="max-w-sm w-full">
          <CardContent className="grid gap-4 pt-6">
            <CardDescription>
              <Trans
                ns="accounts"
                i18nKey="remove-account.form.label"
                values={{
                  name: parseCustomDisplayName(selected),
                }}
              >
                Do you want to remove{' '}
                <span className="font-bold">
                  {parseCustomDisplayName(selected)}
                </span>{' '}
                account?
              </Trans>
            </CardDescription>
          </CardContent>
          <CardFooter className="space-x-6">
            <Button
              className="w-full"
              onClick={() => handleRemove()}
            >
              {t('form.submit-button')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
