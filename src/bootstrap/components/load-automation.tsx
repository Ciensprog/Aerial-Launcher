import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { AutomationStatusType } from '../../config/constants/automation'

import { useAutomationStore } from '../../state/stw-operations/automation'

export function LoadAutomation() {
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

  return null
}
