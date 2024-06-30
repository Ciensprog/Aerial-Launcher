import type { RewardsNotification } from '../../types/notifications'

import { create } from 'zustand'

export type ClaimedRewardsState = {
  data: Array<Array<RewardsNotification>>

  updateData: (value: Array<Array<RewardsNotification>>) => void
}

export const useClaimedRewardsStore = create<ClaimedRewardsState>()(
  (set) => ({
    data: [
      [
        {
          accolades: {
            totalMissionXPRedeemed: 11682,
            totalQuestXPRedeemed: 0,
          },
          accountId: 'e1a8c6d4cbe146199eb93026c0436299',
          rewards: {
            'AccountResource:reagent_c_t03': 10,
            'AccountResource:personnelxp': 32290,
            'AccountResource:schematicxp': 21525,
            'Schematic:sid_pistol_gatling_sr_ore_t01': 1,
            'AccountResource:reagent_alteration_generic': 50,
            'AccountResource:reagent_alteration_upgrade_r': 30,
            'Schematic:sid_pistol_gatling_vr_ore_t01': 1,
            'AccountResource:currency_xrayllama': 92,
            'AccountResource:currency_mtxswap': 80,
          },
        },
      ],
      [
        {
          accolades: {
            totalMissionXPRedeemed: 11682,
            totalQuestXPRedeemed: 0,
          },
          accountId: 'e1a8c6d4cbe146199eb93026c0436299',
          rewards: {
            'AccountResource:reagent_c_t03': 10,
            'AccountResource:personnelxp': 32290,
            'AccountResource:schematicxp': 21525,
            'AccountResource:reagent_alteration_generic': 50,
            'AccountResource:reagent_alteration_upgrade_r': 30,
            'Schematic:sid_pistol_gatling_vr_ore_t01': 1,
            'Schematic:sid_pistol_gatling_vr': 1,
            'AccountResource:eventcurrency_scaling': 92,
          },
        },
        {
          accolades: {
            totalMissionXPRedeemed: 33630,
            totalQuestXPRedeemed: 0,
          },
          accountId: 'e1a8c6d4cbe146199eb93026c0436299',
          rewards: {
            'AccountResource:eventcurrency_scaling': 47,
            'AccountResource:personnelxp': 80850,
            'AccountResource:reagent_alteration_generic': 40,
          },
        },
        {
          accolades: {
            totalMissionXPRedeemed: 2124,
            totalQuestXPRedeemed: 0,
          },
          accountId: 'e1a8c6d4cbe146199eb93026c0436299',
          rewards: {
            'AccountResource:personnelxp': 2225,
            'AccountResource:eventcurrency_scaling': 5,
            'AccountResource:reagent_alteration_generic': 2,
            'AccountResource:reagent_alteration_upgrade_vr': 2,
          },
        },
      ],
    ],

    updateData: (data) =>
      set((state) => ({ data: [...state.data, ...data] })),
  })
)
