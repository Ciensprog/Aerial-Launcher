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
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from '../../../components/ui/card'

import { useGetSelectedAccount } from '../../../hooks/accounts'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/accounts/remove',
  component: () => {
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
              <BreadcrumbPage>Remove Account</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { selected } = useGetSelectedAccount()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <Card className="max-w-sm w-full">
          <CardContent className="grid gap-4 pt-6">
            <CardDescription>
              Do you want to remove{' '}
              <span className="font-bold">{selected?.displayName}</span>{' '}
              account?
            </CardDescription>
          </CardContent>
          <CardFooter className="space-x-6">
            <Button className="w-full">
              Yes, remove account selected
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
