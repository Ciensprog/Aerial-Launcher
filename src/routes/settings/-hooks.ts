import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useSettingsStore } from '../../state/settings/main'

import { toast } from '../../lib/notifications'

const formSchema = z.object({
  path: z.string().min(1, {
    message: '❌ Invalid path',
  }),
})

export function useSetupForm() {
  const currentPath = useSettingsStore((state) => state.path)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      path: currentPath,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    window.electronAPI.updateSettings({
      ...values,
    })

    toast('Information updated')
  }

  return { form, onSubmit }
}
