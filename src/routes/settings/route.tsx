import { Link, createRoute } from '@tanstack/react-router'

import { Route as RootRoute } from '../__root'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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

import { useSetupForm } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/settings',
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
  const { form, onSubmit } = useSetupForm()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-sm w-full"
          >
            <Card className="max-w-sm w-full">
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
      </div>
    </div>
  )
}
