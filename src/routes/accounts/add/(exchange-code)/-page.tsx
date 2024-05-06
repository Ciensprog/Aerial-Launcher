import { exampleCode } from '../../../../config/constants/examples'

import { InputSecret } from '../../../../components/ui/extended/form/input-secret'
import { Separator } from '../../../../components/ui/extended/separator'
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

import { GenerateExchangeCodePage } from './-generate'

import { useSetupForm } from './-hooks'

export function ExchangeCodePage() {
  const { form, selected, onSubmit } = useSetupForm()

  return (
    <div className="flex flex-col gap-8 justify-center max-w-sm w-full">
      {selected && (
        <>
          <GenerateExchangeCodePage />
          <Separator>Or</Separator>
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
                      <InputSecret
                        inputProps={{
                          placeholder: `Example: ${exampleCode}`,
                          ...field,
                        }}
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
