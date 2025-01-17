import type { GroupRecord } from '../../../types/groups'

import { useNavigate } from '@tanstack/react-router'
import { useShallow } from 'zustand/react/shallow'
import { useTranslation } from 'react-i18next'

import { useGetAutomationActions } from '../../../hooks/stw-operations/automation'
import {
  useGetSaveQuestsActions,
  useGetSaveQuestsData,
} from '../../../hooks/stw-operations/save-quests'
import { useGetAutoPinUrnActions } from '../../../hooks/stw-operations/urns'
import {
  useGetSelectedAccount,
  useRemoveSelectedAccount,
} from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'

import { useHomebaseNameStore } from '../../../state/stw-operations/homebase-name'
import {
  useClaimRewardsSelectorStore,
  useKickAllPartySelectorStore,
  useLeavePartySelectorStore,
} from '../../../state/stw-operations/party'
import { useSaveQuestsStore } from '../../../state/stw-operations/save-quests'
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
  const saveQuestsForm = useSaveQuestsStore(
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

  return [homebaseNameForm, saveQuestsForm, xpBoostsForm]
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

  const { selectedAccounts } = useGetSaveQuestsData()
  const { rawSaveQuestsUpdateAccounts } = useGetSaveQuestsActions()

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
    rawSaveQuestsUpdateAccounts(
      selectedAccounts.filter(
        (accountId) => accountId !== selected.accountId
      )
    )

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
