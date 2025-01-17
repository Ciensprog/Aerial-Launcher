import { UpdateIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'

import { exampleCode } from '../../../../config/constants/examples'

import { InputSecret } from '../../../../components/ui/extended/form/input-secret'
import { SeparatorWithTitle } from '../../../../components/ui/extended/separator'
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
  const { t } = useTranslation(['accounts', 'general'])

  const { form, isSubmitting, selected, onSubmit } = useSetupForm()

  return (
    <div className="flex flex-col gap-8 justify-center max-w-sm w-full">
      {selected && (
        <>
          <GenerateExchangeCodePage />
          <SeparatorWithTitle>
            {t('separators.or', {
              ns: 'general',
            })}
          </SeparatorWithTitle>
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
            <CardFooter>
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
    </div>
  )
}
