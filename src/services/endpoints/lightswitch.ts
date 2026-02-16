import { type AxiosRequestConfig } from 'axios'
import { type StringUnion } from '../../types/utils.d'

import { lightswitchService } from '../config/lightswitch'

export function getLightswitchStatus(
  serviceId: string,
  config?: AxiosRequestConfig,
) {
  return lightswitchService.get<LightswitchStatus>(
    `/${serviceId}/status`,
    config,
  )
}

export function getLightswitchStatusBulk(
  serviceIds: Array<string>,
  config?: AxiosRequestConfig,
) {
  const searchParams = new URLSearchParams()

  serviceIds.forEach((serviceId) => {
    searchParams.append('serviceId', serviceId)
  })

  return lightswitchService.get<Array<LightswitchStatus>>(
    `/bulk/status?${searchParams.toString()}`,
    config,
  )
}

export type LightswitchStatus = {
  serviceInstanceId: StringUnion<'fortnite'>
  status: StringUnion<'DOWN' | 'UP'>
  message: string
  maintenanceUri: string | null
  overrideCatalogIds: Array<string>
  allowedActions: Array<unknown>
  banned: boolean
  launcherInfoDTO: {
    appName: StringUnion<'Fortnite'>
    catalogItemId: string
    namespace: StringUnion<'fn'>
  } | null
}
