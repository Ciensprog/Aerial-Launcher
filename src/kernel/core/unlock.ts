import type { AccountData } from '../../types/accounts'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
import { Authentication } from './authentication'

import {
  setPurchaseOrUpgradeHomebaseNode,
  setSkipTutorial,
} from '../../services/endpoints/mcp'
import { storeRequestAccess } from '../../services/endpoints/store'

export class Unlock {
  static async start(accounts: Array<AccountData>) {
    accounts.forEach(async (account) => {
      try {
        const accessToken = await Authentication.verifyAccessToken(account)

        if (!accessToken) {
          MainWindow.instance.webContents.send(
            ElectronAPIEventKeys.UnlockNotification,
            account.accountId,
            false
          )

          return
        }

        await Unlock.storeAccess({
          accessToken,
          accountId: account.accountId,
        })

        await Promise.allSettled(
          nodeIds.map((nodeId) =>
            setPurchaseOrUpgradeHomebaseNode({
              accessToken,
              nodeId,
              accountId: account.accountId,
            })
          )
        )

        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.UnlockNotification,
          account.accountId,
          true
        )

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        //
      }
    })
  }

  static async storeAccess({
    accessToken,
    accountId,
  }: {
    accessToken: string
    accountId: string
  }) {
    try {
      await storeRequestAccess({
        accessToken,
        accountId,
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    try {
      await setSkipTutorial({
        accessToken,
        accountId,
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }
  }
}

const nodeIds = [
  'HomebaseNode:questreward_buildingresourcecap',
  'HomebaseNode:questreward_buildingresourcecap2',
  'HomebaseNode:questreward_buildingresourcecap3',
  'HomebaseNode:questreward_buildingupgradelevel',
  'HomebaseNode:questreward_buildingupgradelevel2',
  'HomebaseNode:questreward_cannyvalley_squad_ssd1',
  'HomebaseNode:questreward_cannyvalley_squad_ssd2',
  'HomebaseNode:questreward_cannyvalley_squad_ssd3',
  'HomebaseNode:questreward_cannyvalley_squad_ssd4',
  'HomebaseNode:questreward_cannyvalley_squad_ssd5',
  'HomebaseNode:questreward_cannyvalley_squad_ssd6',
  'HomebaseNode:questreward_evolution',
  'HomebaseNode:questreward_evolution2',
  'HomebaseNode:questreward_evolution3',
  'HomebaseNode:questreward_evolution4',
  'HomebaseNode:questreward_expedition_dirtbike',
  'HomebaseNode:questreward_expedition_dirtbike2',
  'HomebaseNode:questreward_expedition_dirtbike3',
  'HomebaseNode:questreward_expedition_helicopter',
  'HomebaseNode:questreward_expedition_helicopter2',
  'HomebaseNode:questreward_expedition_helicopter3',
  'HomebaseNode:questreward_expedition_helicopter4',
  'HomebaseNode:questreward_expedition_propplane',
  'HomebaseNode:questreward_expedition_propplane2',
  'HomebaseNode:questreward_expedition_propplane3',
  'HomebaseNode:questreward_expedition_rowboat',
  'HomebaseNode:questreward_expedition_rowboat2',
  'HomebaseNode:questreward_expedition_rowboat3',
  'HomebaseNode:questreward_expedition_rowboat4',
  'HomebaseNode:questreward_expedition_speedboat',
  'HomebaseNode:questreward_expedition_speedboat2',
  'HomebaseNode:questreward_expedition_speedboat3',
  'HomebaseNode:questreward_expedition_speedboat4',
  'HomebaseNode:questreward_expedition_speedboat5',
  'HomebaseNode:questreward_expedition_truck',
  'HomebaseNode:questreward_expedition_truck2',
  'HomebaseNode:questreward_expedition_truck3',
  'HomebaseNode:questreward_expedition_truck4',
  'HomebaseNode:questreward_expedition_truck5',
  'HomebaseNode:questreward_feature_defenderlevelup',
  'HomebaseNode:questreward_feature_herolevelup',
  'HomebaseNode:questreward_feature_reperk',
  'HomebaseNode:questreward_feature_researchsystem',
  'HomebaseNode:questreward_feature_skillsystem',
  'HomebaseNode:questreward_feature_survivorlevelup',
  'HomebaseNode:questreward_feature_survivorslotting',
  'HomebaseNode:questreward_feature_traplevelup',
  'HomebaseNode:questreward_feature_weaponlevelup',
  'HomebaseNode:questreward_herosupport_slot',
  'HomebaseNode:questreward_herotactical_slot',
  'HomebaseNode:questreward_homebase_defender',
  'HomebaseNode:questreward_homebase_defender2',
  'HomebaseNode:questreward_homebase_defender3',
  'HomebaseNode:questreward_homebase_defender4',
  'HomebaseNode:questreward_homebase_defender5',
  'HomebaseNode:questreward_mission_defender',
  'HomebaseNode:questreward_mission_defender2',
  'HomebaseNode:questreward_mission_defender3',
  'HomebaseNode:questreward_newfollower1_slot',
  'HomebaseNode:questreward_newfollower2_slot',
  'HomebaseNode:questreward_newfollower3_slot',
  'HomebaseNode:questreward_newfollower4_slot',
  'HomebaseNode:questreward_newfollower5_slot',
  'HomebaseNode:questreward_newheroloadout2_dummy',
  'HomebaseNode:questreward_newheroloadout3_dummy',
  'HomebaseNode:questreward_newheroloadout4_dummy',
  'HomebaseNode:questreward_newheroloadout5_dummy',
  'HomebaseNode:questreward_newheroloadout6_dummy',
  'HomebaseNode:questreward_newheroloadout7_dummy',
  'HomebaseNode:questreward_newheroloadout8_dummy',
  'HomebaseNode:questreward_pickaxe',
  'HomebaseNode:questreward_plankerton_squad_ssd1',
  'HomebaseNode:questreward_plankerton_squad_ssd2',
  'HomebaseNode:questreward_plankerton_squad_ssd3',
  'HomebaseNode:questreward_plankerton_squad_ssd4',
  'HomebaseNode:questreward_plankerton_squad_ssd5',
  'HomebaseNode:questreward_plankerton_squad_ssd6',
  'HomebaseNode:questreward_recyclecollection',
  'HomebaseNode:questreward_stonewood_squad_ssd1',
  'HomebaseNode:questreward_stonewood_squad_ssd2',
  'HomebaseNode:questreward_stonewood_squad_ssd3',
  'HomebaseNode:questreward_stonewood_squad_ssd4',
  'HomebaseNode:questreward_stonewood_squad_ssd5',
  'HomebaseNode:questreward_stonewood_squad_ssd6',
  'HomebaseNode:questreward_teamperk_slot1',
  'HomebaseNode:questreward_twinepeaks_squad_ssd1',
  'HomebaseNode:questreward_twinepeaks_squad_ssd2',
  'HomebaseNode:questreward_twinepeaks_squad_ssd3',
  'HomebaseNode:questreward_twinepeaks_squad_ssd4',
  'HomebaseNode:questreward_twinepeaks_squad_ssd5',
  'HomebaseNode:questreward_twinepeaks_squad_ssd6',
]
