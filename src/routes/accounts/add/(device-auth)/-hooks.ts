import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: '',
      deviceId: '',
      secret: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
  }

  return { form, onSubmit }
}
