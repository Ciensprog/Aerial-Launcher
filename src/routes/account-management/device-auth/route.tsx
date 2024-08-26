import { createRoute } from '@tanstack/react-router'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'

// import {  } from './-hooks'

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
      <div className="flex items-center justify-center w-full">
        Coming Soon
      </div>
    </div>
  )
}
