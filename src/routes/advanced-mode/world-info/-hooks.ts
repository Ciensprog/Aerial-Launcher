import type { ChangeEventHandler } from 'react'
import type { WorldInfoFileData } from '../../../types/data/advanced-mode/world-info'

import { useEffect, useState } from 'react'

import {
  useCurrentWorldInfoActions,
  useCurrentWorldInfoData,
  useWorldInfoFiles,
} from '../../../hooks/advanced-mode/world-info'

import { getDate } from '../../../lib/dates'
import { toast } from '../../../lib/notifications'

export function useData() {
  const { data, isFetching, isSaving } = useCurrentWorldInfoData()
  const { files } = useWorldInfoFiles()
  const currentData = {
    date: getDate(),
    value: data,
  }

  return {
    currentData,
    files,
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

        if (status) {
          window.electronAPI.requestWorldInfoFiles()
        }
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

export function useItemData({ data }: { data: WorldInfoFileData }) {
  const [name, setName] = useState(data.filename)

  const validName = name.trim() !== ''

  const handleUpdateName: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setName(event.target.value.replace(/\s+/g, ' '))
  }

  return {
    name,
    validName,

    handleUpdateName,
  }
}
