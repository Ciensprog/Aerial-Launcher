import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { z } from 'zod'

import { useAddAccountUpdateSubmittingState } from '../../../../hooks/accounts'
import { useBaseSetupForm } from '../-hooks'

export function useSetupForm() {
  const { t, i18n } = useTranslation(['general'], {
    keyPrefix: 'validations.form.input',
  })

  const formSchema = useMemo(
    () =>
      z.object({
        accountId: z.string().min(32, {
          message: t('account-id.invalid'),
        }),
        deviceId: z.string().min(32, {
          message: t('device-id.invalid'),
        }),
        secret: z.string().min(32, {
          message: t('secret.invalid'),
        }),
      }),
    [i18n.language]
  )

  const { isSubmitting, updateSubmittingState } =
    useAddAccountUpdateSubmittingState('deviceAuth')
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: '',
      deviceId: '',
      secret: '',
    },
  })

  useBaseSetupForm({
    fetcher: window.electronAPI.responseAuthWithDevice,
    type: 'deviceAuth',
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) {
      return
    }

    updateSubmittingState(true)
    window.electronAPI.createAuthWithDevice(values)
    form.reset()
  }

  return { form, isSubmitting, onSubmit }
}
