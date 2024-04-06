import { Link, createFileRoute } from '@tanstack/react-router'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'

import { AuthorizationCodePage } from './-authorization-code'
import { DeviceAuthPage } from './-device-auth'
import { ExchangeCodePage } from './-exchange-code'

const availableTypes = {
  'authorization-code': {
    component: <AuthorizationCodePage />,
    title: 'Authorization Code',
  },
  'exchange-code': {
    component: <ExchangeCodePage />,
    title: 'Exchange Code',
  },
  'device-auth': {
    component: <DeviceAuthPage />,
    title: 'Device Auth',
  },
}

export const Route = createFileRoute('/accounts/add/$type')({
  component: ComponentRoute,
})

function ComponentRoute() {
  const { type } = Route.useParams()
  const currentType = availableTypes[type as keyof typeof availableTypes]

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>My Accounts</BreadcrumbPage>
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
