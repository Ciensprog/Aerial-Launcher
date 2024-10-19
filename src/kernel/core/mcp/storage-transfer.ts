import type {
  MCPQueryProfileStorageItem,
  MCPStorageTransferItem,
} from '../../../types/services/mcp'
import type { AccountData } from '../../../types/accounts'

// import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

// import { MainWindow } from '../../startup/windows/main'
import { Authentication } from '../authentication'

import {
  getQueryProfileStorageProfile,
  setStorageTransfer,
} from '../../../services/endpoints/mcp'

const maxBuildingMaterial = 5000

const calculateMaterial = (
  itemValue: MCPQueryProfileStorageItem,
  total: number
) => {
  const tempTotalSum = total + itemValue.quantity
  const tempRemoveOverflow = maxBuildingMaterial - total
  const quantity =
    tempTotalSum <= maxBuildingMaterial
      ? itemValue.quantity
      : tempRemoveOverflow

  return quantity
}

export class MCPStorageTransfer {
  static async buildingMaterials(account: AccountData) {
    try {
      await new Promise((resolve) => {
        setTimeout(() => resolve(true), 3_500) // 6.5 seconds
      })

      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        return
      }

      const { accountId } = account

      const response = await getQueryProfileStorageProfile({
        accessToken,
        accountId,
      })
      const profileChanges = response.data.profileChanges[0] ?? null
      const items = Object.entries(profileChanges.profile?.items ?? {})
      const buildingMaterials = items.filter(([, itemValue]) =>
        [
          'WorldItem:wooditemdata',
          'WorldItem:stoneitemdata',
          'WorldItem:metalitemdata',
        ].includes(itemValue.templateId)
      )

      if (buildingMaterials.length >= 0) {
        const wood = {
          total: 0,
          items: [] as Array<MCPStorageTransferItem>,
        }
        const stone = {
          total: 0,
          items: [] as Array<MCPStorageTransferItem>,
        }
        const metal = {
          total: 0,
          items: [] as Array<MCPStorageTransferItem>,
        }

        buildingMaterials.forEach(([itemId, itemValue]) => {
          if (itemValue.templateId === 'WorldItem:wooditemdata') {
            if (wood.total < maxBuildingMaterial) {
              const quantity = calculateMaterial(itemValue, wood.total)

              wood.total += quantity
              wood.items.push({
                itemId,
                quantity,
                newItemIdHint: '',
                toStorage: false,
              })
            }

            return
          }

          if (itemValue.templateId === 'WorldItem:stoneitemdata') {
            if (stone.total < maxBuildingMaterial) {
              const quantity = calculateMaterial(itemValue, stone.total)

              stone.total += quantity
              stone.items.push({
                itemId,
                quantity,
                newItemIdHint: '',
                toStorage: false,
              })
            }

            return
          }

          if (itemValue.templateId === 'WorldItem:metalitemdata') {
            if (metal.total < maxBuildingMaterial) {
              const quantity = calculateMaterial(itemValue, metal.total)

              metal.total += quantity
              metal.items.push({
                itemId,
                quantity,
                newItemIdHint: '',
                toStorage: false,
              })
            }

            return
          }
        })

        let itemsToTransfer: Array<MCPStorageTransferItem> = []

        if (wood.items.length > 0) {
          itemsToTransfer = [...itemsToTransfer, ...wood.items]
        }

        if (stone.items.length > 0) {
          itemsToTransfer = [...itemsToTransfer, ...stone.items]
        }

        if (metal.items.length > 0) {
          itemsToTransfer = [...itemsToTransfer, ...metal.items]
        }

        try {
          await setStorageTransfer({
            accessToken,
            accountId,
            items: itemsToTransfer,
          })

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          //
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }
  }
}
