import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { toast } from '../../lib/notifications'
import { useDailyQuestsStore } from '../../state/stw-operations/daily-quests'

export function LoadDailyQuests() {
  const { t } = useTranslation(['stw-operations'])

  useEffect(() => {
    const listListener = window.electronAPI.notificationDailyQuests(
      async (value) => {
        const store = useDailyQuestsStore.getState()
        store.setLoading(false)
        store.setDailyQuests(value)
      },
    )

    const rerollListener = window.electronAPI.notificationDailyQuestReroll(
      async (response) => {
        const store = useDailyQuestsStore.getState()
        store.setRerollingQuest(null)

        if (response.success) {
          store.patchAccountQuests(response.data)
          toast(t('daily-quests.notifications.rerolled'))
          return
        }

        toast(
          response.errorMessage ?? t('daily-quests.notifications.failed'),
        )
      },
    )

    return () => {
      listListener.removeListener()
      rerollListener.removeListener()
    }
  }, [t])

  return null
}
