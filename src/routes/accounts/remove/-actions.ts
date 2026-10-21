import type { GroupRecord } from '../../../types/groups'

import { useNavigate } from '@tanstack/react-router'
import { useShallow } from 'zustand/react/shallow'
import { useTranslation } from 'react-i18next'

import { useGetAutomationActions } from '../../../hooks/stw-operations/automation'
import { useGetAutoPinUrnActions } from '../../../hooks/stw-operations/urns'
import {
  useGetSelectedAccount,
  useRemoveSelectedAccount,
} from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'

import { useHomebaseNameStore } from '../../../state/stw-operations/homebase-name'
import { useDailyQuestsStore } from '../../../state/stw-operations/daily-quests'
import { useDqWeaponsStore } from '../../../state/stw-operations/dq-weapons'
import { useAccountInfoStore } from '../../../state/stw-operations/account-info'
import { usePartyStatusStore } from '../../../state/stw-operations/party-status'
import { useStormShieldsStore } from '../../../state/stw-operations/storm-shields'
import { useCloudStorageStore } from '../../../state/stw-operations/cloud-storage'
import { useAccountExportStore } from '../../../state/account-management/account-export'
import { useAlertsDoneCheckStore } from '../../../state/alerts/alerts-done-check'
import {
  useClaimRewardsSelectorStore,
  useKickAllPartySelectorStore,
  useLeavePartySelectorStore,
} from '../../../state/stw-operations/party'
import { useXPBoostsFormStore } from '../../../state/stw-operations/xpboosts/forms/consume-personal'

import { toast } from '../../../lib/notifications'
import { parseCustomDisplayName } from '../../../lib/utils'

function useClearForms() {
  const homebaseNameForm = useHomebaseNameStore(
    useShallow((state) => ({
      accounts: state.accounts,
      updateAccounts: state.updateAccounts,
    }))
  )
  const dailyQuestsForm = useDailyQuestsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      updateAccounts: state.updateAccounts,
    }))
  )
  const dqWeaponsForm = useDqWeaponsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      updateAccounts: state.updateAccounts,
    }))
  )
  const accountInfoForm = useAccountInfoStore(
    useShallow((state) => ({
      accounts: state.accounts,
      updateAccounts: state.updateAccounts,
    }))
  )
  const stormShieldsForm = useStormShieldsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      updateAccounts: state.updateAccounts,
    }))
  )
  const cloudStorageForm = useCloudStorageStore(
    useShallow((state) => ({
      accounts: state.accounts,
      updateAccounts: state.updateAccounts,
    }))
  )
  const accountExportForm = useAccountExportStore(
    useShallow((state) => ({
      accounts: state.accounts,
      updateAccounts: state.updateAccounts,
    }))
  )
  const alertsDoneCheckForm = useAlertsDoneCheckStore(
    useShallow((state) => ({
      accounts: state.accounts,
      updateAccounts: state.updateAccounts,
    }))
  )
  const partyStatusForm = usePartyStatusStore(
    useShallow((state) => ({
      accounts: state.accounts,
      updateAccounts: state.updateAccounts,
    }))
  )
  const xpBoostsForm = useXPBoostsFormStore(
    useShallow((state) => ({
      accounts: state.accounts,
      updateAccounts: state.updateAccounts,
    }))
  )

  return [
    homebaseNameForm,
    dailyQuestsForm,
    dqWeaponsForm,
    accountInfoForm,
    stormShieldsForm,
    cloudStorageForm,
    accountExportForm,
    alertsDoneCheckForm,
    partyStatusForm,
    xpBoostsForm,
  ]
}

function useClearPartySelectors() {
  const kickAllPartySelector = useKickAllPartySelectorStore(
    useShallow((state) => ({
      accounts: state.value,
      updateAccounts: state.setValue,
    }))
  )
  const claimRewardsSelector = useClaimRewardsSelectorStore(
    useShallow((state) => ({
      accounts: state.value,
      updateAccounts: state.setValue,
    }))
  )
  const leavePartySelector = useLeavePartySelectorStore(
    useShallow((state) => ({
      accounts: state.value,
      updateAccounts: state.setValue,
    }))
  )

  return [kickAllPartySelector, claimRewardsSelector, leavePartySelector]
}

export function useHandleRemove() {
  const { t } = useTranslation(['accounts'], {
    keyPrefix: 'remove-account',
  })

  const navigate = useNavigate()
  const { selected } = useGetSelectedAccount()
  const { removeAccount } = useRemoveSelectedAccount()

  const { groupList, registerGroups } = useGetGroups()

  // Clear forms
  const clearPartySelectors = useClearPartySelectors()
  const clearForms = useClearForms()
  const { removeAccount: removeAccountFromAutoKick } =
    useGetAutomationActions()
  const { removeAccount: removeAccountFromUrns } =
    useGetAutoPinUrnActions()

  const handleRemove = (config?: { defaultRedirect?: boolean }) => {
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

    clearPartySelectors.forEach((currentForm) => {
      currentForm.updateAccounts(
        currentForm.accounts.filter(
          (option) => option.value !== selected.accountId
        )
      )
    })
    clearForms.forEach((currentForm) => {
      currentForm.updateAccounts(
        currentForm.accounts.filter(
          (accountId) => accountId !== selected.accountId
        )
      )
    })

    removeAccountFromAutoKick(selected.accountId)
    removeAccountFromUrns(selected.accountId)
    registerGroups(newGroups)

    window.electronAPI.autoPinUrnsRemove(selected.accountId)
    window.electronAPI.onRemoveAccount(selected.accountId)
    window.electronAPI.updateGroups(newGroups)

    const total = Object.values(removeAccount(selected.accountId)).length

    toast(
      t('notifications.remove.success', {
        name: parseCustomDisplayName(selected),
      })
    )

    const withRedirect = config?.defaultRedirect ?? true

    if (total <= 0 && withRedirect) {
      navigate({ to: '/' })
    }
  }

  return {
    handleRemove,
  }
}
