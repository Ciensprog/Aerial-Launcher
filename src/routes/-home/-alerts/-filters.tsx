import { useState } from 'react'

import {
  World,
  // WorldColor,
} from '../../../config/constants/fortnite/world-info'
import {
  // RarityColor,
  RarityType,
} from '../../../config/constants/resources'

import {
  type SelectOption,
  InputTags,
} from '../../../components/ui/third-party/extended/input-tags'

import { imgRarities, imgResources } from '../../../lib/repository'

export function AlertFilters() {
  const [zones, setZones] = useState<Array<SelectOption>>([])
  const [rarities, setRarities] = useState<Array<SelectOption>>([])
  const [rewards, setRewards] = useState<Array<SelectOption>>([])

  return (
    <div className="">
      <div className="gap-2 grid">
        <InputTags
          placeholder="Select Zone"
          options={[
            {
              // color: WorldColor.Stonewood,
              label: 'Stonewood',
              value: World.Stonewood,
            },
            {
              // color: WorldColor.Plankerton,
              label: 'Plankerton',
              value: World.Plankerton,
            },
            {
              // color: WorldColor.CannyValley,
              label: 'Canny Valley',
              value: World.CannyValley,
            },
            {
              // color: WorldColor.TwinePeaks,
              label: 'Twine Peaks',
              value: World.TwinePeaks,
            },
            {
              // color: WorldColor.Ventures,
              label: 'Ventures',
              value: 'ventures',
            },
          ]}
          value={zones}
          onChange={setZones}
        />
        <InputTags
          placeholder="Select Rarity"
          options={[
            {
              icon: imgRarities(`${RarityType.Common}.png`),
              label: 'Common',
              value: RarityType.Common,
            },
            {
              icon: imgRarities(`${RarityType.Uncommon}.png`),
              label: 'Uncommon',
              value: RarityType.Uncommon,
            },
            {
              icon: imgRarities(`${RarityType.Rare}.png`),
              label: 'Rare',
              value: RarityType.Rare,
            },
            {
              icon: imgRarities(`${RarityType.Epic}.png`),
              label: 'Epic',
              value: RarityType.Epic,
            },
            {
              icon: imgRarities(`${RarityType.Legendary}.png`),
              label: 'Legendary',
              value: RarityType.Legendary,
            },
            {
              icon: imgRarities(`${RarityType.Mythic}.png`),
              label: 'Mythic',
              value: RarityType.Mythic,
            },
          ]}
          value={rarities}
          onChange={setRarities}
        />
        <InputTags
          placeholder="Select Rewards"
          options={[
            {
              icon: imgResources('currency_mtxswap.png'),
              label: 'V-Bucks',
              value: 'vbucks',
            },
            {
              icon: imgResources('voucher_generic_worker.png'),
              label: 'Survivors',
              value: 'survivors',
            },
            {
              icon: imgResources('voucher_generic_hero.png'),
              label: 'Heroes',
              value: 'heroes',
            },
            {
              icon: imgResources('voucher_generic_ranged.png'),
              label: 'Ranged Weapons',
              value: 'ranged-weapons',
            },
            {
              icon: imgResources('voucher_generic_melee.png'),
              label: 'Melee Weapons',
              value: 'melee-weapons',
            },
            {
              icon: imgResources('voucher_generic_trap.png'),
              label: 'Traps',
              value: 'traps',
            },
            {
              icon: imgResources('voucher_cardpack_bronze.png'),
              label: 'Upgrade Llama',
              value: 'upgrade-llama',
            },
            {
              icon: imgResources('voucher_basicpack.png'),
              label: 'Mini Llama',
              value: 'mini-llama',
            },
            {
              icon: imgResources('reagent_c_t01.png'),
              label: 'Pure Drop Of Rain',
              value: 'pdor',
            },
            {
              icon: imgResources('reagent_c_t02.png'),
              label: 'Lightning In A Bottle',
              value: 'liab',
            },
            {
              icon: imgResources('reagent_c_t03.png'),
              label: 'Eye Of The Storm',
              value: 'eots',
            },
            {
              icon: imgResources('reagent_c_t04.png'),
              label: 'Storm Shard',
              value: 'ss',
            },
            {
              icon: imgResources('personnelxp.png'),
              label: 'Survivor XP',
              value: 'survivor-xp',
            },
            {
              icon: imgResources('heroxp.png'),
              label: 'Hero XP',
              value: 'hero-xp',
            },
            {
              icon: imgResources('schematicxp.png'),
              label: 'Schematic XP',
              value: 'schematic-xp',
            },
            {
              icon: imgResources('reagent_alteration_generic.png'),
              label: 'RE-PERK!',
              value: 're-perk',
            },
            {
              icon: imgResources('reagent_alteration_upgrade_uc.png'),
              label: 'Uncommon Perk Up',
              value: 'uncommon-perk-up',
            },
            {
              icon: imgResources('reagent_alteration_upgrade_r.png'),
              label: 'Rare Perk Up',
              value: 'rare-perk-up',
            },
            {
              icon: imgResources('reagent_alteration_upgrade_vr.png'),
              label: 'Epic Perk Up',
              value: 'epic-perk-up',
            },
            {
              icon: imgResources('reagent_alteration_upgrade_sr.png'),
              label: 'Legendary Perk Up',
              value: 'legendary-perk-up',
            },
            {
              icon: imgResources('reagent_alteration_ele_nature.png'),
              label: 'AMP-UP!',
              value: 'amp-up',
            },
            {
              icon: imgResources('reagent_alteration_ele_water.png'),
              label: 'FROST-UP!',
              value: 'frost-up',
            },
            {
              icon: imgResources('reagent_alteration_ele_fire.png'),
              label: 'FIRE-UP!',
              value: 'fire-up',
            },
          ]}
          value={rewards}
          onChange={setRewards}
        />
      </div>
    </div>
  )
}
