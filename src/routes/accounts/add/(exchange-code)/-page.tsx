import { exampleCode } from '../../../../config/constants/examples'

import { Button } from '../../../../components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
} from '../../../../components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../components/ui/form'
import { Input } from '../../../../components/ui/input'
import { Separator } from '../../../../components/ui/separator'

import { GenerateExchangeCodePage } from './-generate'

import { useSetupForm } from './-hooks'

export function ExchangeCodePage() {
  const { form, selected, onSubmit } = useSetupForm()

  return (
    <div className="flex flex-col gap-8 justify-center max-w-sm w-full">
      {selected && (
        <>
          <GenerateExchangeCodePage />

          <Separator className="flex justify-center relative">
            <div className="absolute bg-background font-semibold px-1.5 text-muted-foreground text-sm -top-2.5">
              Or
            </div>
          </Separator>
        </>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-sm w-full"
        >
          <Card className="w-full">
            <CardContent className="grid gap-4 pt-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paste Your Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Example: ${exampleCode}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
              >
                Login
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}
