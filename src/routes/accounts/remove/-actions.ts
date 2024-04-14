import { useNavigate } from '@tanstack/react-router'

import {
  useGetSelectedAccount,
  useRemoveSelectedAccount,
} from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'

export function useHandleRemove() {
  const navigate = useNavigate()
  const { selected } = useGetSelectedAccount()
  const { removeAccount } = useRemoveSelectedAccount()

  const handleRemove = () => {
    if (!selected) {
      return
    }

    window.electronAPI.onRemoveAccount(selected.accountId)

    const total = Object.values(removeAccount(selected.accountId)).length

    toast(`Account ${selected.displayName} was removed`)

    if (total <= 0) {
      navigate({ to: '/' })
    }
  }

  return {
    handleRemove,
  }
}
