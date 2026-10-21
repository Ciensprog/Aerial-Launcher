import type { DqWeaponKind, DqWeaponMatch } from '../lib/stw/dq-weapons'

export type DqWeaponsAccountData = {
  accountId: string
  available: boolean
  errorMessage?: string
  weapons: Record<DqWeaponKind, DqWeaponMatch | null>
  haveCount: number
  complete: boolean
}

export type DqWeaponsFavoriteAccountResult = {
  accountId: string
  already: number
  errorMessage?: string
  favorited: number
}
