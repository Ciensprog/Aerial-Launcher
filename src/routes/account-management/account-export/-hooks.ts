import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetAccountExportActions,
  useGetAccountExportData,
} from '../../../hooks/account-management/account-export'
import { useAccountExportStore } from '../../../state/account-management/account-export'

import { toast } from '../../../lib/notifications'

export function useAccountExportPage() {
  const { t } = useTranslation(['account-management', 'general'])
  const { selectedAccounts, selectedTags } = useGetAccountExportData()
  const { accountExportUpdateAccounts, accountExportUpdateTags } =
    useGetAccountExportActions()
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

  const { isExporting, results, directory, stamp } = useAccountExportStore(
    useShallow((state) => ({
      isExporting: state.isExporting,
      results: state.results,
      directory: state.directory,
      stamp: state.stamp,
    })),
  )
  const setExporting = useAccountExportStore((state) => state.setExporting)
  const lastStamp = useRef(0)

  const exportIsDisabled = isSelectedEmpty || !areThereAccounts || isExporting

  useEffect(() => {
    if (!stamp || stamp === lastStamp.current) {
      return
    }

    lastStamp.current = stamp

    if (results.length <= 0) {
      return
    }

    const done = results.filter((item) => item.ok).length
    const failed = results.find((item) => !item.ok)

    if (failed?.errorMessage && done <= 0) {
      toast(
        t('account-export.failed', {
          message: failed.errorMessage,
        }),
      )

      return
    }

    if (directory) {
      toast(
        t('account-export.saved', {
          done,
          total: results.length,
          path: directory,
        }),
      )
    }
  }, [directory, results, stamp, t])

  const handleExport = () => {
    if (exportIsDisabled) {
      return
    }

    const destinations = getAccounts()

    if (destinations.length <= 0) {
      toast(
        t('form.accounts.no-linked', {
          ns: 'general',
        }),
      )

      return
    }

    setExporting(true)
    window.electronAPI.requestAccountExport(destinations)
  }

  return {
    accounts,
    exportIsDisabled,
    handleExport,
    isExporting,
    parsedSelectedAccounts,
    parsedSelectedTags,
    results,
    tags,
    accountExportUpdateAccounts,
    accountExportUpdateTags,
  }
}
