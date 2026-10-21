import { useEffect } from 'react'

import { useCloudStorageStore } from '../../state/stw-operations/cloud-storage'

export function LoadCloudStorage() {
  useEffect(() => {
    const listListener = window.electronAPI.notificationCloudStorageList(
      async (value) => {
        const store = useCloudStorageStore.getState()

        store.setListing(false)
        store.setListed(true)
        store.setListError(value.errorMessage ?? null)
        store.setFiles(value.available ? value.files : [])
        store.setSelectedFilenames(
          value.available ? value.files.map((file) => file.uniqueFilename) : [],
        )
      },
    )
    const downloadListener =
      window.electronAPI.notificationCloudStorageDownload(async (value) => {
        const store = useCloudStorageStore.getState()

        store.setDownloading(false)
        store.setDownloadResult(value)
      })
    const pickListener = window.electronAPI.notificationCloudStoragePick(
      async (value) => {
        const store = useCloudStorageStore.getState()

        store.setPicking(false)

        if (!value.canceled) {
          store.addLocalFiles(value.files)
        }
      },
    )
    const applyListener = window.electronAPI.notificationCloudStorageApply(
      async (value) => {
        const store = useCloudStorageStore.getState()

        store.setApplying(false)
        store.setApplyResults(value)
      },
    )

    return () => {
      listListener.removeListener()
      downloadListener.removeListener()
      pickListener.removeListener()
      applyListener.removeListener()
    }
  }, [])

  return null
}
