import type {
  ComboboxOption,
  ComboboxProps,
} from '../../../components/ui/extended/combobox/hooks'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetCloudStorageActions,
  useGetCloudStorageData,
} from '../../../hooks/stw-operations/cloud-storage'
import { useGetAccounts } from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'
import { useCloudStorageStore } from '../../../state/stw-operations/cloud-storage'

import { toast } from '../../../lib/notifications'
import { checkIfCustomDisplayNameIsValid } from '../../../lib/validations/properties'
import { parseCustomDisplayName } from '../../../lib/utils'

export function useCloudStoragePage() {
  const { t } = useTranslation(['stw-operations', 'general'])
  const { accountList, accountsArray } = useGetAccounts()
  const { getGroupTagsByAccountId } = useGetGroups()
  const { selectedAccounts, selectedTags } = useGetCloudStorageData()
  const { cloudStorageUpdateAccounts, cloudStorageUpdateTags } =
    useGetCloudStorageActions()
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

  const {
    sourceAccountId,
    files,
    selectedFilenames,
    localFiles,
    listed,
    isListing,
    isDownloading,
    isPicking,
    isApplying,
    listError,
    downloadResult,
    applyResults,
  } = useCloudStorageStore(
    useShallow((state) => ({
      sourceAccountId: state.sourceAccountId,
      files: state.files,
      selectedFilenames: state.selectedFilenames,
      localFiles: state.localFiles,
      listed: state.listed,
      isListing: state.isListing,
      isDownloading: state.isDownloading,
      isPicking: state.isPicking,
      isApplying: state.isApplying,
      listError: state.listError,
      downloadResult: state.downloadResult,
      applyResults: state.applyResults,
    })),
  )
  const setSourceAccountId = useCloudStorageStore(
    (state) => state.setSourceAccountId,
  )
  const setListing = useCloudStorageStore((state) => state.setListing)
  const setDownloading = useCloudStorageStore((state) => state.setDownloading)
  const setPicking = useCloudStorageStore((state) => state.setPicking)
  const setApplying = useCloudStorageStore((state) => state.setApplying)
  const toggleFilename = useCloudStorageStore((state) => state.toggleFilename)
  const removeLocalFile = useCloudStorageStore((state) => state.removeLocalFile)
  const setSelectedFilenames = useCloudStorageStore(
    (state) => state.setSelectedFilenames,
  )
  const setDownloadResult = useCloudStorageStore(
    (state) => state.setDownloadResult,
  )

  const sourceOptions: Array<ComboboxOption> = accountsArray.map((account) => {
    const keywords: Array<string> = [account.displayName]
    const provider = account.provider ?? ''
    const groupTags = getGroupTagsByAccountId(account.accountId)

    if (checkIfCustomDisplayNameIsValid(account.customDisplayName)) {
      keywords.push(account.customDisplayName)
    }

    if (provider !== '') {
      keywords.push(provider)
    }

    groupTags.forEach((tagName) => {
      keywords.push(tagName)
    })

    return {
      label: parseCustomDisplayName(account)!,
      value: account.accountId,
      keywords,
    }
  })

  const sourceValue = sourceOptions.filter(
    (option) => option.value === sourceAccountId,
  )

  const customFilter: ComboboxProps['customFilter'] = (
    _value,
    search,
    keywords,
  ) => {
    const query = search.toLowerCase().trim()

    return keywords?.some((keyword) =>
      keyword.toLowerCase().trim().includes(query),
    )
      ? 1
      : 0
  }

  const sourceAccount = sourceAccountId
    ? accountList[sourceAccountId]
    : null
  const selectedSet = new Set(selectedFilenames)
  const selectedFiles = files.filter((file) =>
    selectedSet.has(file.uniqueFilename),
  )
  const busy = isListing || isDownloading || isPicking || isApplying
  const hasRemoteFiles = Boolean(sourceAccount) && selectedFiles.length > 0
  const hasLocalFiles = localFiles.length > 0
  const loadIsDisabled = !sourceAccount || busy
  const downloadIsDisabled = !sourceAccount || selectedFiles.length <= 0 || busy
  const applyIsDisabled =
    (!hasRemoteFiles && !hasLocalFiles) ||
    isSelectedEmpty ||
    !areThereAccounts ||
    busy

  useEffect(() => {
    if (!downloadResult) {
      return
    }

    if (downloadResult.canceled) {
      setDownloadResult(null)

      return
    }

    const done = downloadResult.results.filter((item) => item.ok).length
    const failed = downloadResult.results.find((item) => !item.ok)

    if (failed?.errorMessage && done <= 0) {
      toast(
        t('cloud-storage.download.failed', {
          message: failed.errorMessage,
        }),
      )
    } else if (downloadResult.directory) {
      toast(
        t('cloud-storage.download.saved', {
          done,
          total: downloadResult.results.length,
          path: downloadResult.directory,
        }),
      )
    }

    setDownloadResult(null)
  }, [downloadResult, setDownloadResult, t])

  const handleSelectSource = (values: Array<ComboboxOption>) => {
    setSourceAccountId(values[0]?.value ?? null)
  }

  const handleLoad = () => {
    if (!sourceAccount || loadIsDisabled) {
      return
    }

    setListing(true)
    window.electronAPI.requestCloudStorageList(sourceAccount)
  }

  const handleToggleAll = () => {
    if (selectedFilenames.length === files.length) {
      setSelectedFilenames([])

      return
    }

    setSelectedFilenames(files.map((file) => file.uniqueFilename))
  }

  const handleDownload = (all = false) => {
    if (!sourceAccount || busy) {
      return
    }

    const filenames = all
      ? files.map((file) => file.uniqueFilename)
      : selectedFiles.map((file) => file.uniqueFilename)

    if (filenames.length <= 0) {
      return
    }

    setDownloading(true)
    window.electronAPI.requestCloudStorageDownload({
      account: sourceAccount,
      filenames,
    })
  }

  const handlePickLocal = () => {
    if (busy) {
      return
    }

    setPicking(true)
    window.electronAPI.requestCloudStoragePick()
  }

  const handleApply = () => {
    if (applyIsDisabled) {
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

    setApplying(true)
    window.electronAPI.requestCloudStorageApply({
      source: hasRemoteFiles ? sourceAccount : null,
      filenames: hasRemoteFiles
        ? selectedFiles.map((file) => file.uniqueFilename)
        : [],
      localFiles,
      destinations,
    })
  }

  return {
    accounts,
    accountList,
    applyIsDisabled,
    applyResults,
    busy,
    customFilter,
    downloadIsDisabled,
    files,
    handleApply,
    handleDownload,
    handleLoad,
    handlePickLocal,
    handleSelectSource,
    handleToggleAll,
    isApplying,
    isDownloading,
    isListing,
    isPicking,
    listed,
    listError,
    localFiles,
    loadIsDisabled,
    parsedSelectedAccounts,
    parsedSelectedTags,
    selectedFilenames,
    selectedFiles,
    sourceOptions,
    sourceValue,
    removeLocalFile,
    tags,
    toggleFilename,
    cloudStorageUpdateAccounts,
    cloudStorageUpdateTags,
  }
}
