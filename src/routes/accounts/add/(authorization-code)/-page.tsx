import { ExternalLinkIcon, UpdateIcon } from '@radix-ui/react-icons'
import { Trans, useTranslation } from 'react-i18next'

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

import { whatIsThis } from '../../../../lib/callbacks'

export function AuthorizationCodePage() {
  const { t } = useTranslation(['accounts', 'general'])

  const { goToAuthorizationCodeURL, goToEpicGamesLogin } = useHandlers()
  const { form, isSubmitting, onSubmit } = useSetupForm()

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
                <AccordionTrigger>
                  {t('auth-code.guide.title')}
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <CardDescription>
                    <Trans
                      ns="accounts"
                      i18nKey="auth-code.guide.steps.1"
                      values={{
                        url: epicGamesLoginURL,
                      }}
                      shouldUnescape
                    >
                      <span className="font-bold">Step 1:</span> You must
                      sign in to your Epic Games account:{' '}
                      <a
                        href={epicGamesLoginURL}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                        title={epicGamesLoginURL}
                        onClick={goToEpicGamesLogin}
                        onAuxClick={whatIsThis()}
                      >
                        {epicGamesLoginURL}
                      </a>
                    </Trans>
                  </CardDescription>
                  <CardDescription>
                    <Trans
                      ns="accounts"
                      i18nKey="auth-code.guide.steps.2"
                    >
                      <span className="font-bold">Step 2:</span> Click on{' '}
                      <a
                        href={epicGamesAuthorizationCodeURL}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                        title={epicGamesAuthorizationCodeURL}
                        onClick={goToAuthorizationCodeURL}
                        onAuxClick={whatIsThis()}
                      >
                        this link
                      </a>{' '}
                      or in button below, this will be open a new tab in
                      your browser with a json response with your
                      authorization code:
                    </Trans>
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
                  <FormLabel>
                    {t('form.credentials.login.label', {
                      ns: 'general',
                    })}
                  </FormLabel>
                  <FormControl>
                    <InputSecret
                      inputProps={{
                        placeholder: t(
                          'form.credentials.login.input.placeholder',
                          {
                            ns: 'general',
                            code: exampleCode,
                          }
                        ),
                        ...field,
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              disabled={isSubmitting}
            />
          </CardContent>
          <CardFooter className="space-x-6">
            <Button
              variant="ghost"
              className="space-x-1 w-full"
              asChild
            >
              <a
                href={epicGamesAuthorizationCodeURL}
                title={epicGamesAuthorizationCodeURL}
                onClick={goToAuthorizationCodeURL}
                onAuxClick={whatIsThis()}
              >
                <Trans
                  ns="general"
                  i18nKey="form.credentials.login.get-code"
                >
                  <span>Get Code</span>
                  <ExternalLinkIcon />
                </Trans>
              </a>
            </Button>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <UpdateIcon className="animate-spin" />
              ) : (
                t('actions.login', {
                  ns: 'general',
                })
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
