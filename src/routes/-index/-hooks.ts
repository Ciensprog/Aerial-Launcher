import type { DropzoneOptions } from 'react-dropzone'
import type { WorldInfoMission } from '../../types/data/advanced-mode/world-info'
import type { WorldInfoData } from '../../types/services/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { useDropzone } from 'react-dropzone'
import { useCallback, useEffect, useRef } from 'react'

import { useWorldInfoActions } from '../../hooks/advanced-mode/world-info'
import {
  useAlertsDoneDataActions,
  useAlertsDoneLoader,
} from '../../hooks/alerts/alerts-done'
import { useAlertsOverviewPaginationInit } from '../../hooks/alerts/overview'

import { worlInfoParser } from '../../lib/parsers/world-info'
import { worldInfoSchema } from '../../lib/validations/schemas/world-info'
import { toast } from '../../lib/notifications'

export function useAlertItemCounter({
  validationFn,
  data,
  key,
}: {
  data: Collection<string, WorldInfoMission>
  key?: string
  validationFn?: (key: string) => boolean
}) {
  return data.reduce((accumulator, mission) => {
    const alert = mission.ui.alert.rewards.find(
      (reward) =>
        validationFn?.(reward.itemId) ??
        (key !== undefined ? reward.itemId.includes(key) : false)
    )

    accumulator += alert?.quantity ?? 0

    return accumulator
  }, 0)
}

export function useIntersectingElement({ deps }: { deps?: unknown }) {
  const $element = useRef<HTMLHeadingElement>(null)

  useEffect(
    () => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          entry.target.classList.toggle(
            'is-sticky',
            entry.intersectionRatio < 1
          )
        },
        {
          threshold: [1],
        }
      )

      if ($element.current) {
        observer.observe($element.current)
      }

      return () => {
        observer.disconnect()
      }
    },
    deps !== undefined ? [deps] : []
  )

  return $element
}

export function useFetchPlayerDataSync() {
  const { updateSearchIsSubmitting } = useAlertsDoneLoader()
  const { updateData } = useAlertsDoneDataActions()

  useEffect(() => {
    const listener = window.electronAPI.fetchPlayerDataNotification(
      async (response) => {
        updateData(response)
        updateSearchIsSubmitting(false)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])
}

export function useDropzoneConfig() {
  const { setWorldInfoData, updateWorldInfoLoading } =
    useWorldInfoActions()
  const { initPagination } = useAlertsOverviewPaginationInit()

  const onDropAccepted: NonNullable<DropzoneOptions['onDropAccepted']> =
    useCallback(async (files) => {
      const [currentFile] = files

      if (currentFile) {
        try {
          updateWorldInfoLoading('isReloading', true)

          const blob = new Blob([currentFile], {
            type: 'application/json',
          })
          const result = worldInfoSchema.parse(
            JSON.parse(await blob.text())
          ) as WorldInfoData
          const { worldInfo } = worlInfoParser(result)

          initPagination(worldInfo.keys().toArray())
          setWorldInfoData(worldInfo)
        } catch (error) {
          toast(
            `Unable to load World Info file, please check if it's the correct file and doesn't have missing data`,
            {
              duration: 5000,
            }
          )
        } finally {
          updateWorldInfoLoading('isReloading', false)
        }
      }
    }, [])
  const { getRootProps, isDragActive, isDragAccept, isDragReject } =
    useDropzone({
      onDropAccepted,
      accept: {
        'application/json': ['.json'],
      },
      maxFiles: 1,
      noClick: true,
    })
  const isFileAccepted = !(isDragActive && isDragAccept)
  const isFileRejected = !(isDragActive && isDragReject)

  return {
    isFileAccepted,
    isFileRejected,

    getRootProps,
  }
}
