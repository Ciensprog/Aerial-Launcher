import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useAddAccountUpdateSubmittingState } from '../../../../hooks/accounts'
import { useBaseSetupForm } from '../-hooks'

const formSchema = z.object({
  accountId: z.string().min(32, {
    message: '❌ Invalid accountId',
  }),
  deviceId: z.string().min(32, {
    message: '❌ Invalid deviceId',
  }),
  secret: z.string().min(32, {
    message: '❌ Invalid secret',
  }),
})

export function useSetupForm() {
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
