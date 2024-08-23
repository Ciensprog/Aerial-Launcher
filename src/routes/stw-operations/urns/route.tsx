// import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
// import { Trash2 } from 'lucide-react'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
// import { Combobox } from '../../../../components/ui/extended/combobox'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
// import { Button } from '../../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
// import { Switch } from '../../../../components/ui/switch'

import { Route as RootRoute } from '../../__root'

// import {  } from './-hooks'

// import {  } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/urns',
  component: () => (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <HomeBreadcrumb />
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>STW Operations</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Auto-pin Urns</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Content />
    </>
  ),
})

export function Content() {
  return (
    <div className="flex flex-grow">
      <div className="flex flex-col items-center justify-center w-full">
        <Card className="max-w-lg w-full">
          <CardHeader className="border-b">
            <CardDescription className="border-l-4 pl-2">
              <span className="font-bold">Note:</span> Only work during
              dungeon seasons.
            </CardDescription>
            <CardDescription>
              This feature will automatically pin the break 100 urns quest
              every time it claims it (with the launcher). So you grinders
              always have track of the urns you have left and don't have to
              bother pinning it every run.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-4">Content</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
