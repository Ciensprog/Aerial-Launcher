import type { GroupRecord } from '../../../types/groups'

import { useNavigate } from '@tanstack/react-router'

import {
  useGetSaveQuestsActions,
  useGetSaveQuestsData,
} from '../../../hooks/stw-operations/save-quests'
import {
  useGetSelectedAccount,
  useRemoveSelectedAccount,
} from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'

import { toast } from '../../../lib/notifications'
import { parseCustomDisplayName } from '../../../lib/utils'

export function useHandleRemove() {
  const navigate = useNavigate()
  const { selected } = useGetSelectedAccount()
  const { removeAccount } = useRemoveSelectedAccount()

  const { groupList, registerGroups } = useGetGroups()

  const { selectedAccounts } = useGetSaveQuestsData()
  const { rawSaveQuestsUpdateAccounts } = useGetSaveQuestsActions()

  const handleRemove = () => {
    if (!selected) {
      return
    }

    const newGroups = Object.entries(groupList).reduce(
      (accumulator, [accountId, tags]) => {
        if (selected.accountId !== accountId) {
          accumulator[accountId] = tags
        }

        return accumulator
      },
      {} as GroupRecord
    )

    registerGroups(newGroups)
    rawSaveQuestsUpdateAccounts(
      selectedAccounts.filter(
        (accountId) => accountId !== selected.accountId
      )
    )

    window.electronAPI.onRemoveAccount(selected.accountId)
    window.electronAPI.updateGroups(newGroups)

    const total = Object.values(removeAccount(selected.accountId)).length

    toast(`Account ${parseCustomDisplayName(selected)} was removed`)

    if (total <= 0) {
      navigate({ to: '/' })
    }
  }

  return {
    handleRemove,
  }
}
