import { useEffect } from 'react'

import {
  useCurrentWorldInfoActions,
  useCurrentWorldInfoData,
} from '../../../hooks/advanced-mode/world-info'

import { dateNow } from '../../../lib/dates'
import { toast } from '../../../lib/notifications'

export function useData() {
  const { data, isFetching, isSaving } = useCurrentWorldInfoData()
  const currentData = {
    date: dateNow(),
    value: data,
  }

  return {
    currentData,
    isFetching,
    isSaving,
  }
}

export function useCurrentActions() {
  const { setIsFetching, setIsSaving } = useCurrentWorldInfoActions()
  const { data, isFetching, isSaving } = useCurrentWorldInfoData()

  useEffect(() => {
    const listener = window.electronAPI.saveWorldInfoDataNotification(
      async (status) => {
        setIsSaving(false)

        toast(
          status
            ? 'The file has been saved'
            : "The file can't be saved, please try again later"
        )
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleRefetch = () => {
    if (isFetching) {
      return
    }

    setIsFetching(true)
    window.electronAPI.requestWorldInfoData()
  }

  const handleSave = (date: string) => () => {
    if (!data || isSaving) {
      return
    }

    setIsSaving(true)
    window.electronAPI.saveWorldInfoData({
      data,
      date,
    })
  }

  return {
    handleRefetch,
    handleSave,
  }
}
