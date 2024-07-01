import {
  useClaimRewardsSelectorStore,
  useInviteFriendsSelectorStore,
  useKickAllPartySelectorStore,
  useLeavePartySelectorStore,
} from '../../state/stw-operations/party'

export function useClaimRewardsForm() {
  const { setValue, value } = useClaimRewardsSelectorStore()

  return {
    value,

    setValue,
  }
}

export function useKickAllPartyForm() {
  const { changeClaimState, claimState, setValue, value } =
    useKickAllPartySelectorStore()

  return {
    claimState,
    value,

    changeClaimState,
    setValue,
  }
}

export function useInviteFriendsForm() {
  const { setValue, value } = useInviteFriendsSelectorStore()

  return {
    value,

    setValue,
  }
}

export function useLeavePartyForm() {
  const { changeClaimState, claimState, setValue, value } =
    useLeavePartySelectorStore()

  return {
    claimState,
    value,

    changeClaimState,
    setValue,
  }
}
