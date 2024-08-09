import { useShallow } from 'zustand/react/shallow'

import { useAutomationStore } from '../../state/stw-operations/automation'

export function useGetAutomationData() {
  const accounts = useAutomationStore((state) => state.accounts)

  return {
    selectedAccounts: accounts,
  }
}

export function useGetAutomationActions() {
  const {
    addAccount,
    removeAccount,
    updateAccountAction,
    updateAccountStatus,
    updateAccountSubmitting,
  } = useAutomationStore(
    useShallow((state) => ({
      removeAccount: state.removeAccount,
      addAccount: state.addOrUpdateAccount,
      updateAccountAction: state.updateAccountAction,
      updateAccountStatus: state.updateAccountStatus,
      updateAccountSubmitting: state.updateAccountSubmitting,
    }))
  )

  return {
    addAccount,
    removeAccount,
    updateAccountAction,
    updateAccountStatus,
    updateAccountSubmitting,
  }
}
