import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useBaseSetupForm } from '../-hooks'

const formSchema = z.object({
  code: z.string().length(32, {
    message: '❌ Invalid code',
  }),
})

export function useSetupForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  })

  useBaseSetupForm({
    fetcher: window.electronAPI.responseAuthWithAuthorization,
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    window.electronAPI.createAuthWithAuthorization(values.code)
    form.reset()
  }

  return { form, onSubmit }
}
