import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetStormShieldsActions,
  useGetStormShieldsData,
} from '../../../hooks/stw-operations/storm-shields'
import { useGetAccounts } from '../../../hooks/accounts'
import { useStormShieldsStore } from '../../../state/stw-operations/storm-shields'

import { toast } from '../../../lib/notifications'

export function useStormShieldsPage() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const { results, isLoading } = useStormShieldsStore(
    useShallow((state) => ({
      results: state.results,
      isLoading: state.isLoading,
    }))
  )
  const setLoading = useStormShieldsStore((state) => state.setLoading)

  const { accountList } = useGetAccounts()
  const { selectedAccounts, selectedTags } = useGetStormShieldsData()
  const { stormShieldsUpdateAccounts, stormShieldsUpdateTags } =
    useGetStormShieldsActions()
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

  const handleFetch = () => {
    if (fetchButtonIsDisabled) {
      return
    }

    const selected = getAccounts()

    if (selected.length <= 0) {
      toast(
        t('form.accounts.no-linked', {
          ns: 'general',
        })
      )

      return
    }

    setLoading(true)
    window.electronAPI.requestStormShields(selected)
  }

  return {
    accounts,
    accountList,
    results,
    fetchButtonIsDisabled,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    stormShieldsUpdateAccounts,
    stormShieldsUpdateTags,
    handleFetch,
  }
}
