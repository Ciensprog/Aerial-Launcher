import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'

import {
  useAddAccountUpdateSubmittingState,
  useGetSelectedAccount,
} from '../../../../hooks/accounts'
import { useBaseSetupForm } from '../-hooks'

import { toast } from '../../../../lib/notifications'

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
    useAddAccountUpdateSubmittingState('exchangeCode')
  const { selected } = useGetSelectedAccount()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  })

  useBaseSetupForm({
    fetcher: window.electronAPI.responseAuthWithExchange,
    type: 'exchangeCode',
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) {
      return
    }

    updateSubmittingState(true)
    window.electronAPI.createAuthWithExchange(values.code)
    form.reset()
  }

  return { form, isSubmitting, selected, onSubmit }
}

export function useGenerateHandlers() {
  const { t } = useTranslation(['accounts'], {
    keyPrefix: 'exchange-code.notifications',
  })

  const { selected } = useGetSelectedAccount()
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  useEffect(() => {
    const listener = window.electronAPI.responseGenerateExchangeCode(
      async ({ code, status }) => {
        if (status) {
          setGeneratedCode(code)
          window.navigator.clipboard.writeText(code).catch(() => {})
        }

        toast(
          status ? t('generate-code.success') : t('generate-code.error')
        )
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleGenerateExchange = () => {
    if (!selected) {
      return
    }

    window.electronAPI.generateExchangeCode(selected)
  }
  const handleCopyCode = () => {
    if (!generatedCode) {
      return
    }

    window.navigator.clipboard
      .writeText(generatedCode)
      .then(() => {
        toast(t('clipboard'))
      })
      .catch(() => {})
  }

  return {
    generatedCode,
    selected,

    handleCopyCode,
    handleGenerateExchange,
  }
}
