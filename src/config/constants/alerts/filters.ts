import {
  World,
  WorldLetter,
} from '../../../config/constants/fortnite/world-info'
import { RarityType } from '../../../config/constants/resources'

import {
  assets,
  imgRarities,
  imgResources,
  imgWorld,
} from '../../../lib/repository'

type FilterOption = {
  color?: string
  icon?: string
  label: string
  value: string
}

export const zoneOptions: Array<FilterOption> = [
  {
    color: 'border-stonewood text-stonewood',
    label: WorldLetter.Stonewood,
    value: World.Stonewood,
  },
  {
    color: 'border-plankerton text-plankerton',
    label: WorldLetter.Plankerton,
    value: World.Plankerton,
  },
  {
    color: 'border-canny-valley text-canny-valley',
    label: WorldLetter.CannyValley,
    value: World.CannyValley,
  },
  {
    color: 'border-twine-peaks text-twine-peaks',
    label: WorldLetter.TwinePeaks,
    value: World.TwinePeaks,
  },
  {
    icon: assets('images/ventures.png'),
    label: 'Ventures',
    value: 'ventures',
  },
]

export const missionTypeOptions: Array<FilterOption> = [
  {
    icon: imgWorld('atlas.png'),
    label: 'Atlas',
    value: 'atlas',
  },
  {
    icon: imgWorld('dtb.png'),
    label: 'Deliver The Bomb',
    value: 'dtb',
  },
  {
    icon: imgWorld('dte.png'),
    label: 'Destroy The Encampments',
    value: 'dte',
  },
  {
    icon: imgWorld('eac.png'),
    label: 'Eliminate And Collect',
    value: 'eac',
  },
  {
    icon: imgWorld('ets.png'),
    label: 'Evacuate The Shelter',
    value: 'ets',
  },
  {
    icon: imgWorld('radar.png'),
    label: 'Build The Radar Grid',
    value: 'radar',
  },
  {
    icon: imgWorld('refuel.png'),
    label: 'Refuel The Homebase',
    value: 'refuel',
  },
  {
    icon: imgWorld('rescue.png'),
    label: 'Rescue The Survivors',
    value: 'rescue',
  },
  {
    icon: imgWorld('resupply.png'),
    label: 'Resupply',
    value: 'resupply',
  },
  {
    icon: imgWorld('rtd.png'),
    label: 'Retrieve The Data',
    value: 'rtd',
  },
  {
    icon: imgWorld('rtl.png'),
    label: 'Ride The Lightning',
    value: 'rtl',
  },
  {
    icon: imgWorld('rts.png'),
    label: 'Repair The Shelter',
    value: 'rts',
  },
]

export const rarityOptions: Array<FilterOption> = [
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
]

export const rewardOptions: Array<FilterOption> = [
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
]
