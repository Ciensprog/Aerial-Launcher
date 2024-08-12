import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { AutomationStatusType } from '../../config/constants/automation'

import { useClaimedRewards } from '../../hooks/stw-operations/claimed-rewards'

import { useAutomationStore } from '../../state/stw-operations/automation'

import { toast } from '../../lib/notifications'

export function LoadAutomation() {
  const { updateData } = useClaimedRewards()

  const { addOrUpdateAccount, refreshAccounts, removeAllAccounts } =
    useAutomationStore(
      useShallow((state) => ({
        addOrUpdateAccount: state.addOrUpdateAccount,
        refreshAccounts: state.refreshAccounts,
        removeAllAccounts: state.removeAllAccounts,
      }))
    )

  useEffect(() => {
    const listener = window.electronAPI.notificationAutomationServiceData(
      async (response, onlyRefresh) => {
        const items = Object.values(response)

        if (items.length <= 0) {
          removeAllAccounts()

          return
        }

        if (onlyRefresh) {
          refreshAccounts(response)

          return
        }

        Object.values(response).forEach((account) => {
          addOrUpdateAccount(account.accountId, {
            actions: account.actions,
            status: AutomationStatusType.LOADING,
            submittings: {
              connecting: true,
            },
          })
        })
      }
    )

    window.electronAPI.automationServiceRequestData()

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.notificationAutomationServiceStart(
      async (response, refresh) => {
        addOrUpdateAccount(response.accountId, {
          status: response.status,
          submittings: {
            connecting: refresh ?? false,
            removing: false,
          },
        })
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener =
      window.electronAPI.notificationGlobalSyncClaimedRewards(
        async (notifications) => {
          updateData(notifications)
        }
      )

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.notificationGlobalClaimedRewards(
      async () => {
        toast('Automation: claimed rewards')
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.notificationAutoKick(
      async (total) => {
        toast(
          total === 0
            ? 'Automation: no user has been kicked'
            : `Automation: kicked ${total} user${total > 1 ? 's' : ''}`
        )
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
