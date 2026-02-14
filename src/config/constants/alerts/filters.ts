import {
  World,
  WorldLetter,
  zonesCategories,
} from '../../../config/constants/fortnite/world-info'
import { RarityType } from '../../../config/constants/resources'

import { assets } from '../../../lib/repository'

type FilterOption<Value extends string | undefined = undefined> = {
  color?: string
  icon?: string
  label: string
  value: Value extends undefined ? string : Value
}

export const zoneOptions: Array<FilterOption<World | 'ventures'>> = [
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
    icon: assets('ventures'),
    label: 'Ventures',
    value: 'ventures',
  },
]

export const missionTypeOptions: Array<
  FilterOption<keyof typeof zonesCategories>
> = [
  {
    icon: assets('atlas'),
    label: 'Atlas',
    value: 'atlas',
  },
  {
    icon: assets('atlas-c2'),
    label: 'Atlas',
    value: 'atlas-c2',
  },
  {
    icon: assets('atlas-c3'),
    label: 'Atlas',
    value: 'atlas-c3',
  },
  {
    icon: assets('atlas-c4'),
    label: 'Atlas',
    value: 'atlas-c4',
  },
  {
    icon: assets('dtb'),
    label: 'Deliver The Bomb',
    value: 'dtb',
  },
  {
    icon: assets('dte'),
    label: 'Destroy The Encampments',
    value: 'dte',
  },
  {
    icon: assets('eac'),
    label: 'Eliminate And Collect',
    value: 'eac',
  },
  {
    icon: assets('ets'),
    label: 'Evacuate The Shelter',
    value: 'ets',
  },
  {
    icon: assets('radar'),
    label: 'Build The Radar Grid',
    value: 'radar',
  },
  {
    icon: assets('refuel'),
    label: 'Refuel The Homebase',
    value: 'refuel',
  },
  {
    icon: assets('rescue'),
    label: 'Rescue The Survivors',
    value: 'rescue',
  },
  {
    icon: assets('resupply'),
    label: 'Resupply',
    value: 'resupply',
  },
  {
    icon: assets('rtd'),
    label: 'Retrieve The Data',
    value: 'rtd',
  },
  {
    icon: assets('rtl'),
    label: 'Ride The Lightning',
    value: 'rtl',
  },
  {
    icon: assets('rts'),
    label: 'Repair The Shelter',
    value: 'rts',
  },
  {
    icon: assets('htm'),
    label: 'Hunt The Titan',
    value: 'htm',
  },
]

export const rarityOptions: Array<FilterOption<RarityType>> = [
  {
    icon: assets(RarityType.Common),
    label: 'Common',
    value: RarityType.Common,
  },
  {
    icon: assets(RarityType.Uncommon),
    label: 'Uncommon',
    value: RarityType.Uncommon,
  },
  {
    icon: assets(RarityType.Rare),
    label: 'Rare',
    value: RarityType.Rare,
  },
  {
    icon: assets(RarityType.Epic),
    label: 'Epic',
    value: RarityType.Epic,
  },
  {
    icon: assets(RarityType.Legendary),
    label: 'Legendary',
    value: RarityType.Legendary,
  },
]

export const rewardOptions: Array<FilterOption> = [
  {
    icon: assets('currency_mtxswap'),
    label: 'V-Bucks',
    value: 'currency_mtxswap',
  },
  {
    icon: assets('voucher_generic_worker'),
    label: 'Survivors',
    value: 'Worker',
  },
  {
    icon: assets('voucher_generic_manager'),
    label: 'Lead Survivors',
    value: 'Manager',
  },
  {
    icon: assets('voucher_generic_defender'),
    label: 'Defenders',
    value: 'Defender',
  },
  {
    icon: assets('voucher_generic_hero'),
    label: 'Heroes',
    value: 'Hero',
  },
  {
    icon: assets('voucher_generic_ranged'),
    label: 'Ranged Weapons',
    value: 'Ranged',
  },
  {
    icon: assets('voucher_generic_melee'),
    label: 'Melee Weapons',
    value: 'Melee',
  },
  {
    icon: assets('voucher_generic_trap'),
    label: 'Traps',
    value: 'Trap',
  },
  {
    icon: assets('voucher_cardpack_bronze'),
    label: 'Upgrade Llama',
    value: 'voucher_cardpack_bronze',
  },
  {
    icon: assets('voucher_basicpack'),
    label: 'Mini Llama',
    value: 'voucher_basicpack',
  },
  {
    icon: assets('reagent_c_t01'),
    label: 'Pure Drop Of Rain',
    value: 'reagent_c_t01',
  },
  {
    icon: assets('reagent_c_t02'),
    label: 'Lightning In A Bottle',
    value: 'reagent_c_t02',
  },
  {
    icon: assets('reagent_c_t03'),
    label: 'Eye Of The Storm',
    value: 'reagent_c_t03',
  },
  {
    icon: assets('reagent_c_t04'),
    label: 'Storm Shard',
    value: 'reagent_c_t04',
  },
  {
    icon: assets('heroxp'),
    label: 'Hero XP',
    value: 'heroxp',
  },
  {
    icon: assets('schematicxp'),
    label: 'Schematic XP',
    value: 'schematicxp',
  },
  {
    icon: assets('personnelxp'),
    label: 'Survivor XP',
    value: 'personnelxp',
  },
  {
    icon: assets('reagent_alteration_upgrade_sr'),
    label: 'Legendary Perk Up',
    value: 'reagent_alteration_upgrade_sr',
  },
  {
    icon: assets('reagent_alteration_upgrade_vr'),
    label: 'Epic Perk Up',
    value: 'reagent_alteration_upgrade_vr',
  },
  {
    icon: assets('reagent_alteration_upgrade_r'),
    label: 'Rare Perk Up',
    value: 'reagent_alteration_upgrade_r',
  },
  {
    icon: assets('reagent_alteration_upgrade_uc'),
    label: 'Uncommon Perk Up',
    value: 'reagent_alteration_upgrade_uc',
  },
  {
    icon: assets('reagent_alteration_ele_fire'),
    label: 'FIRE-UP!',
    value: 'reagent_alteration_ele_fire',
  },
  {
    icon: assets('reagent_alteration_ele_nature'),
    label: 'AMP-UP!',
    value: 'reagent_alteration_ele_nature',
  },
  {
    icon: assets('reagent_alteration_ele_water'),
    label: 'FROST-UP!',
    value: 'reagent_alteration_ele_water',
  },
  {
    icon: assets('reagent_alteration_generic'),
    label: 'RE-PERK!',
    value: 'reagent_alteration_generic',
  },
]
