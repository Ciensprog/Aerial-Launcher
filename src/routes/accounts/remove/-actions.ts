import { useNavigate } from '@tanstack/react-router'

import {
  useGetSaveQuestsActions,
  useGetSaveQuestsData,
} from '../../../hooks/stw-operations/save-quests'
import {
  useGetSelectedAccount,
  useRemoveSelectedAccount,
} from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'
import { parseCustomDisplayName } from '../../../lib/utils'

export function useHandleRemove() {
  const navigate = useNavigate()
  const { selected } = useGetSelectedAccount()
  const { removeAccount } = useRemoveSelectedAccount()

  const { selectedAccounts } = useGetSaveQuestsData()
  const { rawSaveQuestsUpdateAccounts } = useGetSaveQuestsActions()

  const handleRemove = () => {
    if (!selected) {
      return
    }

    rawSaveQuestsUpdateAccounts(
      selectedAccounts.filter(
        (accountId) => accountId !== selected.accountId
      )
    )
    window.electronAPI.onRemoveAccount(selected.accountId)

    const total = Object.values(removeAccount(selected.accountId)).length

    toast(
      `Account ${selected.displayName}${parseCustomDisplayName(selected)} was removed`
    )

    if (total <= 0) {
      navigate({ to: '/' })
    }
  }

  return {
    handleRemove,
  }
}
