import type { Settings } from '../../types/settings'

import { zodResolver } from '@hookform/resolvers/zod'
import { useDebouncedPersist } from '../../hooks/use-debounced-persist'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { z } from 'zod'
import { useShallow } from 'zustand/react/shallow'

import { useSettingsStore } from '../../state/settings/main'

import { buildSettingsSnapshot } from '../../lib/settings/snapshot'
import { settingsSchema } from '../../lib/validations/schemas/settings'
import { toast } from '../../lib/notifications'

export function useSetupForm() {
  const { t } = useTranslation(['settings'])

  const {
    autoDailyQuests,
    claimingRewards,
    customProcess,
    missionInterval,
    epicGamesDir,
    epicGamesExtraDirs,
    path,
    systemTray,
    userAgent,
    customProxyEnabled,
    customProxyPort,
  } = useSettingsStore(
    useShallow((state) => ({
      autoDailyQuests: state.autoDailyQuests,
      claimingRewards: state.claimingRewards,
      customProcess: state.customProcess,
      missionInterval: state.missionInterval,
      epicGamesDir: state.epicGamesDir,
      epicGamesExtraDirs: state.epicGamesExtraDirs,
      path: state.path,
      systemTray: state.systemTray,
      userAgent: state.userAgent,
      customProxyEnabled: state.customProxyEnabled,
      customProxyPort: state.customProxyPort,
    })),
  )
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    values: {
      autoDailyQuests,
      claimingRewards,
      customProcess,
      missionInterval,
      epicGamesDir,
      epicGamesExtraDirs,
      path,
      systemTray,
      userAgent,
      customProxyEnabled,
      customProxyPort,
    },
  })

  const persistSettings = useCallback((partial: Partial<Settings>) => {
    const state = useSettingsStore.getState()
    const updated = buildSettingsSnapshot(state, partial)

    state.updateSettings(partial)
    window.electronAPI.updateSettings(updated)
  }, [])

  const debouncedPersistSettings = useDebouncedPersist(persistSettings, 400)

  const onDetectPath = async () => {
    const result = await window.electronAPI.detectGamePath()

    form.setValue('path', result.path, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
    debouncedPersistSettings.cancel()
    persistSettings({ path: result.path })
  }

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    debouncedPersistSettings.cancel()
    persistSettings(values)
    toast(t('form.submit.status.success'))
  }

  return {
    form,
    onDetectPath,
    onSubmit,
    persistSettings,
    debouncedPersistSettings,
  }
}
