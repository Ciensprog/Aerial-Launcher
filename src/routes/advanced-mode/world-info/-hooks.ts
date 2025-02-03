import type { ChangeEventHandler, FormEventHandler } from 'react'
import type { WorldInfoFileData } from '../../../types/data/advanced-mode/world-info'

import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import {
  useCurrentWorldInfoActions,
  useCurrentWorldInfoData,
  useWorldInfoFiles,
} from '../../../hooks/advanced-mode/world-info'

import {
  getDateWithFormat,
  getDate,
  getExtendedDateFormat,
} from '../../../lib/dates'
import { toast } from '../../../lib/notifications'

export function useData() {
  const { data, isFetching, isSaving } = useCurrentWorldInfoData()
  const { files } = useWorldInfoFiles()
  const currentData = {
    date: getDateWithFormat(undefined, 'YYYY-MM-DD HH[h] m[m] s[s]'),
    value: data,
  }

  return {
    currentData,
    files,
    isFetching,
    isSaving,
  }
}

export function useSearch({ files }: { files: Array<WorldInfoFileData> }) {
  const [searchValue, setSearchValue] = useState('')
  // const [includeFileData, setIncludeFileData] = useState(false)

  const filteredFiles =
    searchValue.length > 0
      ? files.filter((item) => {
          const data = [
            getExtendedDateFormat(item.date),
            getDate(item.date),
            item.filename,
          ]

          // if (includeFileData) {
          //   data.push(JSON.stringify(item.data))
          // }

          return data.some((value) =>
            value
              .toLowerCase()
              .trim()
              .includes(searchValue.toLowerCase().trim())
          )
        })
      : files

  const onChangeSearchValue: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setSearchValue(event.currentTarget.value.replace(/\s+/g, ' '))
  }

  return {
    filteredFiles,
    // includeFileData,
    searchValue,

    onChangeSearchValue,
    // setIncludeFileData,
  }
}

export function useCurrentActions() {
  const { t } = useTranslation(['advanced-mode'], {
    keyPrefix: 'world-info',
  })

  const { setIsFetching, setIsSaving } = useCurrentWorldInfoActions()
  const { data, isFetching, isSaving } = useCurrentWorldInfoData()

  useEffect(() => {
    const listener = window.electronAPI.saveWorldInfoDataNotification(
      async (status) => {
        setIsSaving(false)

        toast(
          status
            ? t('notifications.save.success')
            : t('notifications.save.error')
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

  useEffect(() => {
    const listener = window.electronAPI.deleteWorldInfoFileNotification(
      async ({ filename, status }) => {
        toast(
          status
            ? t('notifications.delete.success', {
                filename,
              })
            : t('notifications.delete.error', {
                filename,
              })
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

  useEffect(() => {
    const listener = window.electronAPI.exportWorldInfoFileNotification(
      async ({ status }) => {
        if (status !== 'canceled') {
          toast(
            status === 'success'
              ? t('notifications.export.success')
              : t('notifications.export.error')
          )
        }
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.openWorldInfoFileNotification(
      async ({ filename, status }) => {
        toast(
          status
            ? t('notifications.open.success', {
                filename,
              })
            : t('notifications.open.error', {
                filename,
              })
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

  useEffect(() => {
    const listener = window.electronAPI.renameWorldInfoFileNotification(
      async (status) => {
        toast(
          status
            ? t('notifications.rename.success')
            : t('notifications.rename.error')
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

  const handleSave = (filename: string) => () => {
    if (!data || isSaving) {
      return
    }

    setIsSaving(true)
    window.electronAPI.saveWorldInfoData({
      data,
      filename,
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

  const handleDeleteFile = () => {
    window.electronAPI.deleteWorldInfoFile(data)
  }

  const handleExportFile = () => {
    window.electronAPI.exportWorldInfoFile(data)
  }

  const handleOpenFile = () => {
    window.electronAPI.openWorldInfoFile(data)
  }

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    if (validName) {
      window.electronAPI.renameWorldInfoFile(data, name.trim())
    } else {
      setName(data.filename)
    }
  }

  return {
    name,
    validName,

    handleDeleteFile,
    handleExportFile,
    handleOpenFile,
    handleUpdateName,
    onSubmit,
  }
}
