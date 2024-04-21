import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useGetSelectedAccount } from '../../../../hooks/accounts'
import { useBaseSetupForm } from '../-hooks'

import { toast } from '../../../../lib/notifications'

const formSchema = z.object({
  code: z.string().length(32, {
    message: '❌ Invalid code',
  }),
})

export function useSetupForm() {
  const { selected } = useGetSelectedAccount()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  })

  useBaseSetupForm({
    fetcher: window.electronAPI.responseAuthWithExchange,
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    window.electronAPI.createAuthWithExchange(values.code)
    form.reset()
  }

  return { form, selected, onSubmit }
}

export function useGenerateHandlers() {
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
          status
            ? 'Exchange code has been generated and copied into clipboard'
            : 'An error has occurred trying generate exchange code, try again later'
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
        toast('Exchange code has been copied into clipboard')
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
