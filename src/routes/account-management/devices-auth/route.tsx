import type { DeviceAuthInfoWithStates } from '../../../state/accounts/devices-auth'
import type { AccountData } from '../../../types/accounts'

import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { useState } from 'react'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion'
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
import { Toggle } from '../../../components/ui/toggle'

import { useActions, useData, useParseIdentities } from './-hooks'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { getShortDateFormat, relativeTime } from '../../../lib/dates'
import { cn, parseCustomDisplayName } from '../../../lib/utils'

const dots = '•••'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/account-management/device-auth',
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
              <BreadcrumbPage>{t('options.devices-auth')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['account-management'], {
    keyPrefix: 'devices-auth',
  })

  const {
    data,
    disabledFetchButton,
    isFetching,
    selected,

    handleFetchDevices,
  } = useData()

  return (
    <div className="flex flex-grow">
      <div className="flex flex-col items-center justify-center w-full">
        <Card className="max-w-lg w-full">
          <CardHeader className="border-b">
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <CardDescription>
              <Trans
                ns="general"
                i18nKey="account-selected"
                values={{ name: parseCustomDisplayName(selected) }}
              >
                Account selected:{' '}
                <span className="font-bold">
                  {parseCustomDisplayName(selected)}
                </span>
              </Trans>
            </CardDescription>
            <div>
              <Button
                className="w-full"
                disabled={disabledFetchButton}
                onClick={handleFetchDevices}
              >
                {isFetching ? (
                  <UpdateIcon className="animate-spin h-4" />
                ) : (
                  t('form.submit-button')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-lg mt-5 w-full">
          {data.length > 0 && (
            <p className="leading-none mb-5 text-center uppercase">
              <Trans
                ns="account-management"
                i18nKey="devices-auth.results.title"
                values={{
                  total: numberWithCommaSeparator(data.length),
                }}
              >
                Devices Found:
                <span className="block font-bold text-4xl">
                  {numberWithCommaSeparator(data.length)}
                </span>
              </Trans>
            </p>
          )}
          <Accordion
            className="flex flex-col gap-2"
            type="multiple"
          >
            {data.map((device, index) => (
              <DeviceItem
                account={selected!}
                data={device}
                key={index}
              />
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}

function DeviceItem({
  account,
  data,
}: {
  account: AccountData
  data: DeviceAuthInfoWithStates
}) {
  const { t } = useTranslation(['account-management', 'general'])

  const { identities } = useParseIdentities({ data })
  const { isFetching, handleRemoveDevice } = useActions()

  return (
    <AccordionItem
      className="border rounded"
      value={data.deviceId}
    >
      <div className="flex items-center justify-center pr-3">
        <AccordionTrigger
          className={cn(
            'flex-none font-normal gap-1 px-4 py-2 w-full [&>svg]:ml-auto'
          )}
        >
          <span>{data.deviceId.slice(0, 3)}•••</span>
          {'一'}
          <span className="font-bold- text-muted-foreground text-xs">
            {t('devices-auth.results.item.last-access')}:{' '}
            {data.lastAccess
              ? relativeTime(data.lastAccess.dateTime)
              : t('unknown', {
                  ns: 'general',
                })}
          </span>
          {identities.length > 0 && (
            <span className="font-bold text-muted-foreground text-xs">
              ({identities.join(', ')})
            </span>
          )}
        </AccordionTrigger>
        <Button
          className="size-8 text-[#ff6868]/60 [&:not(:disabled)]:hover:text-[#ff6868]"
          size="icon"
          variant="ghost"
          onClick={handleRemoveDevice(account, data)}
          disabled={isFetching || data.isDeleting}
        >
          <Trash2 size={16} />
        </Button>
      </div>
      <AccordionContent className="flex flex-col gap-3 pt-4 px-4">
        <div>
          <div className="font-bold">
            {t('user-agent', {
              ns: 'general',
            })}
          </div>
          <p className="break-all text-muted-foreground">
            {data.userAgent ??
              t('unknown', {
                ns: 'general',
              })}
          </p>
        </div>
        <ItemInformation
          title={t('devices-auth.results.item.created')}
          data={data.created}
        />
        <ItemInformation
          title={t('devices-auth.results.item.last-access')}
          data={data.lastAccess}
        />
      </AccordionContent>
    </AccordionItem>
  )
}

function ItemInformation({
  data,
  title,
}: {
  data?: {
    ipAddress: string
    location: string
    dateTime: string
  }
  title: string
}) {
  const { t } = useTranslation(['account-management', 'general'])

  const [isPressed, setIsPressed] = useState(false)
  const parsedDate = data?.dateTime
    ? relativeTime(data.dateTime)
    : t('unknown', {
        ns: 'general',
      })

  return (
    <div>
      <div className="flex gap-2 items-center">
        <div className="font-bold">{title}</div>
        <Toggle
          className="h-auto px-2 py-1 text-xs"
          size="sm"
          variant="outline"
          pressed={isPressed}
          onPressedChange={setIsPressed}
          aria-label="toggle hidden information"
        >
          {isPressed
            ? t('hide-information', {
                ns: 'general',
              })
            : t('show-information', {
                ns: 'general',
              })}
        </Toggle>
      </div>
      <p>
        <span className="text-muted-foreground">
          {t('location', {
            ns: 'general',
          })}
          :
        </span>{' '}
        {isPressed
          ? data?.location ??
            t('unknown', {
              ns: 'general',
            })
          : dots}
      </p>
      <p>
        <span className="text-muted-foreground">
          {t('ip-address', {
            ns: 'general',
          })}
          :
        </span>{' '}
        {isPressed
          ? data?.ipAddress ??
            t('unknown', {
              ns: 'general',
            })
          : dots}
      </p>
      <p>
        <span className="text-muted-foreground">
          {t('date', {
            ns: 'general',
          })}
          :
        </span>{' '}
        {isPressed ? (
          <>
            {parsedDate}{' '}
            {data?.dateTime !== undefined && (
              <span className="text-muted-foreground text-xs">
                ({getShortDateFormat(data.dateTime)})
              </span>
            )}
          </>
        ) : (
          dots
        )}
      </p>
    </div>
  )
}
