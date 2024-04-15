import { Link, createRoute } from '@tanstack/react-router'

import { Route as RootRoute } from '../../__root'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'

import { AuthorizationCodePage } from './(authorization-code)/-page'
import { DeviceAuthPage } from './(device-auth)/-page'
import { ExchangeCodePage } from './(exchange-code)/-page'

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

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/accounts/add/$type',
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
