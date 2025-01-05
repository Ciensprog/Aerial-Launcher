import { useTranslation } from 'react-i18next'

import { Button } from '../../../components/ui/button'

import {
  useAlertsOverviewFiltersActions,
  useAlertsOverviewFiltersData,
} from '../../../hooks/alerts/filters'

export function ResetFiltersButton() {
  const { t } = useTranslation(['alerts'], {
    keyPrefix: 'filters',
  })

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
      variant="secondary"
      onClick={resetFilters}
      disabled={isDisabled}
    >
      {t('actions.clear')}
    </Button>
  )
}
