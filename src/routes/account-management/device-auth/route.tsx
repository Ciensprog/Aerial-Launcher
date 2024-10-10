import type { DeviceAuthInfoWithStates } from '../../../state/accounts/devices-auth'
import type { AccountData } from '../../../types/accounts'

import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
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
import { dateWithFormat, relativeTime } from '../../../lib/dates'
import { cn, parseCustomDisplayName } from '../../../lib/utils'

const dots = '•••'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/account-management/device-auth',
  component: () => {
    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Account Management</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Devices Auth</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
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
            <CardDescription>
              Select an account and manage your devices auth created. User
              Agent, Creation and Last Access are displayed with
              information on: Location, IP Address and Date.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <CardDescription>
              Account selected:{' '}
              <span className="font-bold">
                {parseCustomDisplayName(selected)}
              </span>
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
                  'Request Devices Auth'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-lg mt-5 w-full">
          {data.length > 0 && (
            <p className="leading-none mb-5 text-center uppercase">
              Devices Found:
              <span className="block font-bold text-4xl">
                {numberWithCommaSeparator(data.length)}
              </span>
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
            Last Access:{' '}
            {data.lastAccess
              ? relativeTime(data.lastAccess.dateTime)
              : 'Unknown'}
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
          <div className="font-bold">User Agent</div>
          <p className="break-all text-muted-foreground">
            {data.userAgent ?? 'Unknown'}
          </p>
        </div>
        <ItemInformation
          title="Created"
          data={data.created}
        />
        <ItemInformation
          title="Last Access"
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
  const [isPressed, setIsPressed] = useState(false)
  const parsedDate = data?.dateTime
    ? relativeTime(data.dateTime)
    : 'Unknown'

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
          {isPressed ? 'Hide Information' : 'Show Hidden Information'}
        </Toggle>
      </div>
      <p>
        <span className="text-muted-foreground">Location:</span>{' '}
        {isPressed ? (data?.location ?? 'Unknown') : dots}
      </p>
      <p>
        <span className="text-muted-foreground">IP Address:</span>{' '}
        {isPressed ? (data?.ipAddress ?? 'Unknown') : dots}
      </p>
      <p>
        <span className="text-muted-foreground">Date:</span>{' '}
        {isPressed ? (
          <>
            {parsedDate}{' '}
            {data?.dateTime !== undefined && (
              <span className="text-muted-foreground text-xs">
                ({dateWithFormat(data.dateTime, 'MM/dd/yyyy hh:mm:ss a')})
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
