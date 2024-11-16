import { Button } from '../../../components/ui/button'

import {
  useAlertsOverviewFiltersActions,
  useAlertsOverviewFiltersData,
} from '../../../hooks/alerts/filters'

export function ResetFiltersButton() {
  const { missionTypes, rarities, rewards, zones } =
    useAlertsOverviewFiltersData()
  const { resetFilters } = useAlertsOverviewFiltersActions()

  const isDisabled = !(
    missionTypes.length > 0 ||
    rarities.length > 0 ||
    rewards.length > 0 ||
    zones.length > 0
  )

  return (
    <Button
      className=""
      variant="secondary"
      onClick={resetFilters}
      disabled={isDisabled}
    >
      Clear Selections
    </Button>
  )
}
