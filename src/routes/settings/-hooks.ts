import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useSettingsStore } from '../../state/settings/main'

import { toast } from '../../lib/notifications'
import { useShallow } from 'zustand/react/shallow'

const formSchema = z.object({
  path: z.string().trim().min(1, {
    message: '❌ Invalid path',
  }),
  userAgent: z
    .string()
    .trim()
    .min(1, {
      message: '❌ Invalid User Agent',
    })
    .optional(),
  systemTray: z
    .boolean({
      message: '❌ Invalid value',
    })
    .default(false)
    .optional(),
})

export function useSetupForm() {
  const { path, systemTray, userAgent } = useSettingsStore(
    useShallow((state) => ({
      path: state.path,
      systemTray: state.systemTray,
      userAgent: state.userAgent,
    }))
  )
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      path,
      systemTray,
      userAgent,
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
