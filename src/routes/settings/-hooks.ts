import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useShallow } from 'zustand/react/shallow'

import { useSettingsStore } from '../../state/settings/main'

import { settingsSchema } from '../../lib/validations/schemas/settings'
import { toast } from '../../lib/notifications'
import { useTranslation } from 'react-i18next'

export function useSetupForm() {
  const { t } = useTranslation(['settings'])

  const { claimingRewards, missionInterval, path, systemTray, userAgent } =
    useSettingsStore(
      useShallow((state) => ({
        claimingRewards: state.claimingRewards,
        missionInterval: state.missionInterval,
        path: state.path,
        systemTray: state.systemTray,
        userAgent: state.userAgent,
      }))
    )
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    values: {
      claimingRewards,
      missionInterval,
      path,
      systemTray,
      userAgent,
    },
  })

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    window.electronAPI.updateSettings({
      ...values,
    })

    toast(t('form.submit.status.success'))
  }

  return {
    form,
    onSubmit,
  }
}
