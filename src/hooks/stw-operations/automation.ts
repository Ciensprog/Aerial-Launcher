// import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

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
    updateAccountSubmitting,
  } = useAutomationStore(
    useShallow((state) => ({
      removeAccount: state.removeAccount,
      addAccount: state.addAccount,
      updateAccountAction: state.updateAccountAction,
      updateAccountSubmitting: state.updateAccountSubmitting,
    }))
  )

  return {
    addAccount,
    removeAccount,
    updateAccountAction,
    updateAccountSubmitting,
  }
}
