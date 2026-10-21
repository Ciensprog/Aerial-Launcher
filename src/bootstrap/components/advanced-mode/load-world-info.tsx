import type { WorldInfoData } from '../../../types/services/advanced-mode/world-info'

import { useEffect } from 'react'

import { defaultWorldInfo } from '../../../config/constants/fortnite/world-info'

import {
  useCurrentWorldInfoActions,
  useWorldInfoActions,
} from '../../../hooks/advanced-mode/world-info'
import { useAlertsOverviewPaginationInit } from '../../../hooks/alerts/overview'

import { worlInfoParser } from '../../../lib/parsers/world-info'
import { worldInfoSchema } from '../../../lib/validations/schemas/world-info'

export function LoadWorldInfoData() {
  const { setData, setIsFetching } = useCurrentWorldInfoActions()

  useEffect(() => {
    const listener = window.electronAPI.responseWorldInfoData(
      async (response) => {
        setData(response.data)
        setIsFetching(false)
      }
    )

    setIsFetching(true)
    window.electronAPI.requestWorldInfoData()

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}

export function LoadHomeWorldInfo() {
  const { setWorldInfoData, setRawWorldInfoData, updateWorldInfoLoading } =
    useWorldInfoActions()
  const { initPagination } = useAlertsOverviewPaginationInit()

  useEffect(() => {
    let cancelled = false
    let retries = 0
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    const isEmpty = (data: {
      theaters?: unknown[]
      missions?: unknown[]
    }) => !data.theaters?.length || !data.missions?.length

    const applyData = (response: WorldInfoData) => {
      try {
        const result = worldInfoSchema.parse(response) as WorldInfoData
        const { worldInfo } = worlInfoParser(result)

        initPagination(worldInfo.keys().toArray())
        setWorldInfoData(worldInfo)
        setRawWorldInfoData(response)

        return result
      } catch {
        const { worldInfo } = worlInfoParser(
          defaultWorldInfo as WorldInfoData
        )

        setWorldInfoData(worldInfo)
        setRawWorldInfoData(null)

        return defaultWorldInfo
      }
    }

    const listener = window.electronAPI.responseHomeWorldInfo(
      async (response) => {
        if (cancelled) {
          return
        }

        const parsed = applyData(response)

        if (isEmpty(parsed) && retries < 2) {
          retries += 1
          retryTimer = setTimeout(() => {
            window.electronAPI.requestHomeWorldInfo()
          }, 500 * retries)
          return
        }

        updateWorldInfoLoading('isFetching', false)
        updateWorldInfoLoading('isReloading', false)
      }
    )

    updateWorldInfoLoading('isFetching', true)
    window.electronAPI.requestHomeWorldInfo()

    return () => {
      cancelled = true
      listener.removeListener()
      if (retryTimer) {
        clearTimeout(retryTimer)
      }
    }
  }, [])

  return null
}
