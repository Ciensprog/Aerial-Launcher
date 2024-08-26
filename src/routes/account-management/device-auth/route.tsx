import { createRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { Combobox } from '../../../components/ui/extended/combobox'
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

// import {  } from './-hooks'

import { cn } from '../../../lib/utils'

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
            <div className="grid gap-4">
              <div className="space-y-2">
                <Combobox
                  className="max-w-full"
                  emptyPlaceholder="No accounts"
                  emptyContent="No account found"
                  placeholder="Select an account"
                  placeholderSearch={`Search on 2 accounts`}
                  options={[]}
                  value={[]}
                  // customFilter={customFilter}
                  onChange={() => {}}
                  // onSelectItem={onSelectItem}
                  emptyContentClassname="py-6 text-center text-sm"
                  // disabled={accountSelectorIsDisabled}
                  // disabledItem={accountSelectorIsDisabled}
                  // inputSearchIsDisabled={accountSelectorIsDisabled}
                  hideInputSearchWhenOnlyOneOptionIsAvailable
                  hideSelectorOnSelectItem
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-lg mt-5 w-full">
          <Accordion
            className="flex flex-col gap-2"
            type="multiple"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <DeviceItem
                deviceId={`item-${index}`}
                key={index}
              />
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}

function DeviceItem({ deviceId }: { deviceId: string }) {
  return (
    <AccordionItem
      className="border rounded"
      value={deviceId}
    >
      <AccordionTrigger
        className={cn(
          'flex-none font-normal gap-2 px-4 py-2 w-full [&>svg]:ml-auto'
        )}
      >
        a0b•••{' '}
        {deviceId === 'item-0' && (
          <span className="font-bold text-muted-foreground text-xs">
            (Used In This Launcher)
          </span>
        )}
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 pb-2 pt-4 px-4">
        <div className="">
          <div className="font-bold">User Agent</div>
          <p className="break-all text-muted-foreground">
            Fortnite/++Fortnite+Release-XX.YY-CL-XXXXXXXX
            Windows/AA.BB.CCCCC.D.EEE.64bit
          </p>
        </div>
        <ItemInformation title="Created" />
        <ItemInformation title="Last Access" />
        <div className="border-t flex flex-col items-end justify-center pt-2">
          <Button
            className="size-8 text-[#ff6868]/60 [&:not(:disabled)]:hover:text-[#ff6868]"
            size="icon"
            variant="ghost"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

function ItemInformation({ title }: { title: string }) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div className="">
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
      <p className="">
        <span className="text-muted-foreground">Location:</span>{' '}
        {isPressed ? 'Sample' : dots}
      </p>
      <p className="">
        <span className="text-muted-foreground">IP Address:</span>{' '}
        {isPressed ? '192.168.1.1' : dots}
      </p>
      <p className="">
        <span className="text-muted-foreground">Date:</span>{' '}
        {isPressed ? '2024-01-01T00:00:00.000Z' : dots}
      </p>
    </div>
  )
}
