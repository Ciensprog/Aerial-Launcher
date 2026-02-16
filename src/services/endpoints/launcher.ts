import { type AxiosRequestConfig } from 'axios'
import { type StringUnion } from '../../types/utils.d'

import {
  launcherAvailablePlatforms,
  launcherService,
} from '../config/launcher'

export function getLauncherAssetForCatalogItem(
  params: {
    appName: string
    catalogItemId: string
    platform: keyof typeof launcherAvailablePlatforms
    label?: 'Live' | 'Production'
  },
  config?: AxiosRequestConfig,
) {
  return launcherService.get<LauncherAssetForCatalogItem>(
    `/public/assets/${params.platform}/${params.catalogItemId}/${params.appName}${params.label ? `?label=${params.label}` : ''}`,
    config,
  )
}

export type LauncherAssetForCatalogItem = {
  appName: StringUnion<'Fortnite'>
  labelName: StringUnion<'Live-Windows'>
  buildVersion: string
  catalogItemId: string
  metadata: {
    installationPoolId: StringUnion<'FortniteInstallationPool'>
  }
  expires: string
  items: {
    MANIFEST: {
      signature: string
      distribution: string
      path: string
      hash: string
      additionalDistributions: Array<string>
    }
    CHUNKS: {
      signature: string
      distribution: string
      path: string
      additionalDistributions: Array<string>
    }
  }
  assetId: StringUnion<'Fortnite'>
}
