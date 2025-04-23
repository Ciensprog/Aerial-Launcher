import { useTranslation } from 'react-i18next'

import {
  missionTypeOptions,
  rarityOptions,
  rewardOptions,
  zoneOptions,
} from '../../../config/constants/alerts/filters'

import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../components/ui/toggle-group'

import {
  useAlertsOverviewFiltersActions,
  useAlertsOverviewFiltersData,
} from '../../../hooks/alerts/filters'

import { cn } from '../../../lib/utils'

export function AlertFilters() {
  const { t } = useTranslation(['alerts'], {
    keyPrefix: 'filters',
  })

  const { missionTypes, rarities, rewards, zones, group } =
    useAlertsOverviewFiltersData()
  const { toggleFilterKeys, toggleGroup } =
    useAlertsOverviewFiltersActions()

  return (
    <div
      className={cn(
        'pb-0 px-6 mt-3',
        '[&_.label]:inline-flex [&_.label]:mb-2.5',
        '[&_.toggle-group]:flex-wrap [&_.toggle-group]:gap-2 [&_.toggle-group]:justify-start',
        '[&_.toggle-item]:px-0 [&_.toggle-item]:py-0 [&_.toggle-item]:size-14 [&_.toggle-item[data-state="on"]]:outline [&_.toggle-item[data-state="on"]]:outline-2 [&_.toggle-item[data-state="on"]]:outline-muted-foreground/40',
        '[&_.toggle-icon]:size-8'
      )}
    >
      <div className="flex flex-col gap-5">
        <div>
          <Label className="label">{t('sections.zones')}</Label>
          <ToggleGroup
            className="toggle-group"
            type="multiple"
            value={zones}
            onValueChange={toggleFilterKeys('zones')}
          >
            {zoneOptions.map((option) => (
              <ToggleGroupItem
                className="toggle-item"
                variant="outline"
                value={option.value}
                key={option.value}
              >
                {option.icon ? (
                  <img
                    src={option.icon}
                    className="toggle-icon"
                  />
                ) : (
                  <span
                    className={cn(
                      'border- border-opacity-40- flex font-bold items-center justify-center relative rounded size-8 text-2xl uppercase',
                      option.color
                    )}
                  >
                    {option.label}
                  </span>
                )}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div>
          <div className="flex font-medium items-center mb-2.5">
            <Label className="">{t('sections.types')}</Label>
            <div className="flex gap-2 items-center ml-auto">
              <Label
                className="max-sm:text-xs"
                htmlFor="group-missions"
              >
                Group Missions
              </Label>
              <Switch
                className="cursor-pointer"
                id="group-missions"
                onCheckedChange={toggleGroup}
                checked={group}
              />
            </div>
          </div>
          <ToggleGroup
            className="toggle-group"
            type="multiple"
            value={missionTypes}
            onValueChange={toggleFilterKeys('missionTypes')}
          >
            {missionTypeOptions.map((option) => (
              <ToggleGroupItem
                className="toggle-item"
                variant="outline"
                value={option.value}
                key={option.value}
              >
                <img
                  src={option.icon}
                  className="toggle-icon"
                />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div>
          <Label className="label">{t('sections.rarities')}</Label>
          <ToggleGroup
            className="toggle-group"
            type="multiple"
            value={rarities}
            onValueChange={toggleFilterKeys('rarities')}
          >
            {rarityOptions.map((option) => (
              <ToggleGroupItem
                className="toggle-item"
                variant="outline"
                value={option.value}
                key={option.value}
              >
                <img
                  src={option.icon}
                  className="toggle-icon"
                />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div>
          <Label className="label">{t('sections.rewards')}</Label>
          <ToggleGroup
            className="toggle-group"
            type="multiple"
            value={rewards}
            onValueChange={toggleFilterKeys('rewards')}
          >
            {rewardOptions.map((option) => (
              <ToggleGroupItem
                className="toggle-item"
                variant="outline"
                value={option.value}
                key={option.value}
              >
                <img
                  src={option.icon}
                  className="toggle-icon"
                />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
    </div>
  )
}
