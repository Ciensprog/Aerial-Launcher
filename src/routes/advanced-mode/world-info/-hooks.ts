import type { ChangeEventHandler, FormEventHandler } from 'react'
import type { WorldInfoFileData } from '../../../types/data/advanced-mode/world-info'

import { useEffect, useState } from 'react'

import {
  useCurrentWorldInfoActions,
  useCurrentWorldInfoData,
  useWorldInfoFiles,
} from '../../../hooks/advanced-mode/world-info'

import { getDateWithFormat, getDate } from '../../../lib/dates'
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
            getDateWithFormat(item.date, 'dddd, MMMM D, YYYY h:m:s A'),
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

  useEffect(() => {
    const listener = window.electronAPI.deleteWorldInfoFileNotification(
      async ({ filename, status }) => {
        toast(
          status
            ? `The file "${filename}" has been saved`
            : `The file "${filename}" can't be deleted, please try again later`
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
              ? 'The file has been exported'
              : `The file can't be exported, please try again later`
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
            ? `The file "${filename}" has been opened`
            : `The file "${filename}" can't be opened, please try again later`
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
            ? 'The file has been renamed'
            : "The file can't be renamed, please try again later"
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
