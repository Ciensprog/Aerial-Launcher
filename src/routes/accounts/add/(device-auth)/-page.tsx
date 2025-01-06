import { UpdateIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'

import { InputSecret } from '../../../../components/ui/extended/form/input-secret'
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

import { useSetupForm } from './-hooks'

export function DeviceAuthPage() {
  const { t } = useTranslation(['general'])

  const { form, isSubmitting, onSubmit } = useSetupForm()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-sm w-full"
      >
        <Card className="w-full">
          <CardContent className="grid gap-4 pt-6">
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.credentials.account-id')}</FormLabel>
                  <FormControl>
                    <InputSecret inputProps={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              disabled={isSubmitting}
            />
            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.credentials.device-id')}</FormLabel>
                  <FormControl>
                    <InputSecret inputProps={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              disabled={isSubmitting}
            />
            <FormField
              control={form.control}
              name="secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.credentials.secret')}</FormLabel>
                  <FormControl>
                    <InputSecret inputProps={field} />
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
                t('actions.login')
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
