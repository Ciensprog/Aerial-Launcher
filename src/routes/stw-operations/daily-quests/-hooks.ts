import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetDailyQuestsActions,
  useGetDailyQuestsData,
} from '../../../hooks/stw-operations/daily-quests'
import { useGetAccounts } from '../../../hooks/accounts'
import { useDailyQuestsStore } from '../../../state/stw-operations/daily-quests'

import { toast } from '../../../lib/notifications'

export function useDailyQuestsData() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const { dailyQuests, isLoading, rerollingQuest } = useDailyQuestsStore(
    useShallow((state) => ({
      dailyQuests: state.dailyQuests,
      isLoading: state.isLoading,
      rerollingQuest: state.rerollingQuest,
    })),
  )
  const setLoading = useDailyQuestsStore((state) => state.setLoading)
  const setRerollingQuest = useDailyQuestsStore(
    (state) => state.setRerollingQuest,
  )

  const { accountList } = useGetAccounts()
  const { selectedAccounts, selectedTags } = useGetDailyQuestsData()
  const { dailyQuestsUpdateAccounts, dailyQuestsUpdateTags } =
    useGetDailyQuestsActions()
  const {
    accounts,
    areThereAccounts,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,

    getAccounts,
  } = useAccountSelectorData({
    selectedAccounts,
    selectedTags,
  })

  const fetchButtonIsDisabled =
    isSelectedEmpty || isLoading || !areThereAccounts
  const rerollIsDisabled = rerollingQuest !== null || isLoading

  const handleFetch = () => {
    if (fetchButtonIsDisabled) {
      return
    }

    const selectedAccounts = getAccounts()

    if (selectedAccounts.length <= 0) {
      toast(
        t('form.accounts.no-linked', {
          ns: 'general',
        }),
      )

      return
    }

    setLoading(true)

    window.electronAPI.requestDailyQuests(selectedAccounts)
  }

  const handleReroll = (accountId: string, questId: string) => {
    if (rerollIsDisabled) {
      return
    }

    const account = accountList[accountId]

    if (!account) {
      toast(t('daily-quests.notifications.failed'))

      return
    }

    setRerollingQuest({
      accountId,
      questId,
    })

    window.electronAPI.rerollDailyQuest(account, questId)
  }

  return {
    accounts,
    accountList,
    dailyQuests,
    fetchButtonIsDisabled,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    rerollIsDisabled,
    rerollingQuest,
    tags,

    dailyQuestsUpdateAccounts,
    dailyQuestsUpdateTags,
    handleFetch,
    handleReroll,
  }
}
