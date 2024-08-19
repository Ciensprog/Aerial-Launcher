import { createRoute } from '@tanstack/react-router'

import { Route as RootRoute } from '../__root'

import { HomeBreadcrumb } from '../../components/navigations/breadcrumb/home'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardFooter } from '../../components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'

import { AccountCustomization } from './-account-customization/-index'
import { TagsManagement } from './-tags-management/-index'

import { useGetAccounts } from '../../hooks/accounts'
import { useSetupForm } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/settings',
  component: () => {
    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { accountsArray } = useGetAccounts()
  const { form, onSubmit } = useSetupForm()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col gap-12 max-w-md w-full">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full"
            >
              <Card className="w-full">
                <CardContent className="grid gap-4 pt-6">
                  <FormField
                    control={form.control}
                    name="path"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Path</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userAgent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Custom User Agent{' '}
                          <span className="block text-muted-foreground text-xs">
                            (Only is applied if you don't have Fortnite
                            installed)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="space-x-6">
                  <Button
                    type="submit"
                    className="w-full"
                  >
                    Update Information
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>

          <TagsManagement />

          {accountsArray.length > 0 && <AccountCustomization />}
        </div>
      </div>
    </div>
  )
}
