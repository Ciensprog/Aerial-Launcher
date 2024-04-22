import { createRoute } from '@tanstack/react-router'

import { Route as RootRoute } from './__root'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '../components/ui/breadcrumb'

import { CheckNewVersion } from '../bootstrap/components/check-new-version'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: IndexComponent,
})

export function IndexComponent() {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CheckNewVersion />
      <div className="flex flex-grow">
        <div className="flex items-center justify-center w-full">
          Coming Soon!
        </div>
      </div>
    </>
  )
}
