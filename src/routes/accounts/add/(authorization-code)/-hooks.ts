import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMemo } from 'react'
import { z } from 'zod'

import { useAddAccountUpdateSubmittingState } from '../../../../hooks/accounts'
import { useBaseSetupForm } from '../-hooks'
import { useTranslation } from 'react-i18next'

export function useSetupForm() {
  const { t, i18n } = useTranslation(['general'], {
    keyPrefix: 'validations.form.input',
  })

  const formSchema = useMemo(
    () =>
      z.object({
        code: z.string().length(32, {
          message: t('code.invalid'),
        }),
      }),
    [i18n.language]
  )

  const { isSubmitting, updateSubmittingState } =
    useAddAccountUpdateSubmittingState('authorizationCode')
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  })

  useBaseSetupForm({
    fetcher: window.electronAPI.responseAuthWithAuthorization,
    type: 'authorizationCode',
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) {
      return
    }

    updateSubmittingState(true)
    window.electronAPI.createAuthWithAuthorization(values.code)
    form.reset()
  }

  return { form, isSubmitting, onSubmit }
}
