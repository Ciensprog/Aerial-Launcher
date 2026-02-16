import type { DropzoneOptions } from 'react-dropzone'
import type { WorldInfoMission } from '../../types/data/advanced-mode/world-info'
import type { WorldInfoData } from '../../types/services/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useRef } from 'react'

import {
  useWorldInfo,
  useWorldInfoActions,
} from '../../hooks/advanced-mode/world-info'
import {
  useAlertsDoneDataActions,
  useAlertsDoneLoader,
  useAlertsDoneMarkedSync,
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
        (key !== undefined ? reward.itemId.includes(key) : false),
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
            entry.intersectionRatio < 1,
          )
        },
        {
          threshold: [1],
        },
      )

      if ($element.current) {
        observer.observe($element.current)
      }

      return () => {
        observer.disconnect()
      }
    },
    deps !== undefined ? [deps] : [],
  )

  return $element
}

export function useFetchPlayerDataSync() {
  const { data } = useWorldInfo()
  const { updateSearchIsSubmitting } = useAlertsDoneLoader()
  const { updateData } = useAlertsDoneDataActions()
  const { syncCompletedAlerts } = useAlertsDoneMarkedSync()

  useEffect(() => {
    const listener = window.electronAPI.fetchPlayerDataNotification(
      async (response) => {
        if (response.data) {
          const toSync =
            response.data.profileChanges?.profile.stats.attributes.mission_alert_redemption_record?.claimData?.reduce(
              (accumulator, current) => {
                let currentMissionGuid: string | undefined

                data.forEach((missions) => {
                  missions.forEach((mission) => {
                    if (
                      mission.raw.alert?.missionAlertGuid ===
                      current.missionAlertId
                    ) {
                      currentMissionGuid = mission.raw.mission.missionGuid
                    }
                  })
                })

                if (currentMissionGuid) {
                  accumulator[currentMissionGuid] = true
                }

                return accumulator
              },
              {} as Record<string, boolean>,
            ) ?? {}

          syncCompletedAlerts(response.data.lookup.id, toSync)
        }

        updateData(response)
        updateSearchIsSubmitting(false)
      },
    )

    return () => {
      listener.removeListener()
    }
  }, [data])
}

export function useDropzoneConfig() {
  const { i18n, t } = useTranslation(['alerts'])

  const { setWorldInfoData, updateWorldInfoLoading } =
    useWorldInfoActions()
  const { initPagination } = useAlertsOverviewPaginationInit()

  const onDropAccepted: NonNullable<DropzoneOptions['onDropAccepted']> =
    useCallback(
      async (files) => {
        const [currentFile] = files

        if (currentFile) {
          try {
            updateWorldInfoLoading('isReloading', true)

            const blob = new Blob([currentFile], {
              type: 'application/json',
            })
            const result = worldInfoSchema.parse(
              JSON.parse(await blob.text()),
            ) as WorldInfoData
            const { worldInfo } = worlInfoParser(result)

            initPagination(worldInfo.keys().toArray())
            setWorldInfoData(worldInfo)
          } catch (error) {
            toast(t('world-info.notifications.error'), {
              duration: 5000,
            })
          } finally {
            updateWorldInfoLoading('isReloading', false)
          }
        }
      },
      [i18n.language],
    )
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
