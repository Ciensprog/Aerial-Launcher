import type {
  StormShieldZone,
  StormShieldZoneProgress,
} from '../lib/stw/storm-shields'

export type StormShieldsAccountData = {
  accountId: string
  available: boolean
  errorMessage?: string
  zones: Record<StormShieldZone, StormShieldZoneProgress>
  total: number
  complete: boolean
}
