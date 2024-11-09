import {
  missionTypeOptions,
  rarityOptions,
  rewardOptions,
  zoneOptions,
} from '../../../config/constants/alerts/filters'

import { Label } from '../../../components/ui/label'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../components/ui/toggle-group'

import { cn } from '../../../lib/utils'

export function AlertFilters() {
  return (
    <div
      className={cn(
        'pb-0 px-3 mt-3',
        '[&_.label]:inline-flex [&_.label]:mb-2.5',
        '[&_.toggle-group]:flex-wrap [&_.toggle-group]:gap-2 [&_.toggle-group]:justify-start',
        '[&_.toggle-item]:px-0 [&_.toggle-item]:py-0 [&_.toggle-item]:size-14 [&_.toggle-item[data-state="on"]]:outline [&_.toggle-item[data-state="on"]]:outline-2 [&_.toggle-item[data-state="on"]]:outline-muted-foreground/40',
        '[&_.toggle-icon]:size-8'
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="">
          <Label className="label">Select Zones</Label>
          <ToggleGroup
            className="toggle-group"
            type="multiple"
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

        <div className="">
          <Label className="label">Select Mission Types</Label>
          <ToggleGroup
            className="toggle-group"
            type="multiple"
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

        <div className="">
          <Label className="label">Select Rarities</Label>
          <ToggleGroup
            className="toggle-group"
            type="multiple"
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

        <div className="">
          <Label className="label">Select Rewards</Label>
          <ToggleGroup
            className="toggle-group"
            type="multiple"
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
