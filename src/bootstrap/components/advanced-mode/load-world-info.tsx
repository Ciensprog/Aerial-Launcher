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
  const { setWorldInfoData, updateWorldInfoLoading } =
    useWorldInfoActions()
  const { initPagination } = useAlertsOverviewPaginationInit()

  useEffect(() => {
    const listener = window.electronAPI.responseHomeWorldInfo(
      async (response) => {
        try {
          const result = worldInfoSchema.parse(response) as WorldInfoData
          const { worldInfo } = worlInfoParser(result)

          initPagination(worldInfo.keys().toArray())
          setWorldInfoData(worldInfo)

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          const { worldInfo } = worlInfoParser(
            defaultWorldInfo as WorldInfoData
          )

          setWorldInfoData(worldInfo)
        } finally {
          updateWorldInfoLoading('isFetching', false)
          updateWorldInfoLoading('isReloading', false)
        }
      }
    )

    updateWorldInfoLoading('isFetching', true)
    window.electronAPI.requestHomeWorldInfo()

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
