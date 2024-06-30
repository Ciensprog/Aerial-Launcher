import { useClaimedRewardsStore } from '../../state/stw-operations/claimed-rewards'

export function useClaimedRewards() {
  const { data, updateData } = useClaimedRewardsStore()

  return {
    data,

    updateData,
  }
}
