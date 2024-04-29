import { ExternalLinkIcon } from '@radix-ui/react-icons'

import { exampleCode } from '../../../../config/constants/examples'
import {
  epicGamesAuthorizationCodeURL,
  epicGamesLoginURL,
} from '../../../../config/fortnite/links'

import { InputSecret } from '../../../../components/ui/extended/form/input-secret'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../../components/ui/accordion'
import { Button } from '../../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '../../../../components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../components/ui/form'

import { useHandlers } from '../-hooks'
import { useSetupForm } from './-hooks'

export function AuthorizationCodePage() {
  const { goToAuthorizationCodeURL } = useHandlers()
  const { form, onSubmit } = useSetupForm()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-sm w-full"
      >
        <Card className="w-full">
          <CardHeader className="pt-0">
            <Accordion type="multiple">
              <AccordionItem value="how-to-get">
                <AccordionTrigger>How to get the code:</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <CardDescription>
                    <span className="font-bold">Step 1:</span> You must
                    sign in to your Epic Games account:{' '}
                    <a
                      href={epicGamesLoginURL}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      title={epicGamesLoginURL}
                    >
                      {epicGamesLoginURL}
                    </a>
                  </CardDescription>
                  <CardDescription>
                    <span className="font-bold">Step 2:</span> Click on{' '}
                    <a
                      href={epicGamesAuthorizationCodeURL}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      title={epicGamesAuthorizationCodeURL}
                      onClick={goToAuthorizationCodeURL}
                    >
                      this link
                    </a>{' '}
                    or in button below, this will be open a new tab in your
                    browser with a json response with your authorization
                    code:
                  </CardDescription>
                  <pre className="border p-2 text-xs">
                    <>
                      {JSON.stringify(
                        {
                          redirectUrl: '.../?code=COPY_THIS',
                          authorizationCode: 'COPY_THIS',
                          exchangeCode: null,
                          sid: null,
                          ssoV2Enabled: true,
                        },
                        null,
                        2
                      )}
                    </>
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardHeader>
          <CardContent className="grid gap-4">
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
          <CardFooter className="space-x-6">
            <Button
              variant="ghost"
              className="w-full"
              asChild
            >
              <a
                href={epicGamesAuthorizationCodeURL}
                title={epicGamesAuthorizationCodeURL}
                onClick={goToAuthorizationCodeURL}
              >
                Get Code <ExternalLinkIcon className="ml-1" />
              </a>
            </Button>
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
  )
}
