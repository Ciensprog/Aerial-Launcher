import {
  World,
  WorldLetter,
  zonesCategories,
} from '../../../config/constants/fortnite/world-info'
import { RarityType } from '../../../config/constants/resources'

import {
  assets,
  imgRarities,
  imgResources,
  imgWorld,
} from '../../../lib/repository'

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
    icon: assets('images/ventures.png'),
    label: 'Ventures',
    value: 'ventures',
  },
]

export const missionTypeOptions: Array<
  FilterOption<keyof typeof zonesCategories>
> = [
  {
    icon: imgWorld('atlas.png'),
    label: 'Atlas',
    value: 'atlas',
  },
  {
    icon: imgWorld('atlas-c2.png'),
    label: 'Atlas',
    value: 'atlas-c2',
  },
  {
    icon: imgWorld('atlas-c3.png'),
    label: 'Atlas',
    value: 'atlas-c3',
  },
  {
    icon: imgWorld('atlas-c4.png'),
    label: 'Atlas',
    value: 'atlas-c4',
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
  {
    icon: imgWorld('htm.png'),
    label: 'Hunt The Titan',
    value: 'htm',
  },
]

export const rarityOptions: Array<FilterOption<RarityType>> = [
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
]

export const rewardOptions: Array<FilterOption> = [
  {
    icon: imgResources('currency_mtxswap.png'),
    label: 'V-Bucks',
    value: 'currency_mtxswap',
  },
  {
    icon: imgResources('voucher_generic_worker.png'),
    label: 'Survivors',
    value: 'Worker',
  },
  {
    icon: imgResources('voucher_generic_manager.png'),
    label: 'Lead Survivors',
    value: 'Manager',
  },
  {
    icon: imgResources('voucher_generic_defender.png'),
    label: 'Defenders',
    value: 'Defender',
  },
  {
    icon: imgResources('voucher_generic_hero.png'),
    label: 'Heroes',
    value: 'Hero',
  },
  {
    icon: imgResources('voucher_generic_ranged.png'),
    label: 'Ranged Weapons',
    value: 'Ranged',
  },
  {
    icon: imgResources('voucher_generic_melee.png'),
    label: 'Melee Weapons',
    value: 'Melee',
  },
  {
    icon: imgResources('voucher_generic_trap.png'),
    label: 'Traps',
    value: 'Trap',
  },
  {
    icon: imgResources('voucher_cardpack_bronze.png'),
    label: 'Upgrade Llama',
    value: 'voucher_cardpack_bronze',
  },
  {
    icon: imgResources('voucher_basicpack.png'),
    label: 'Mini Llama',
    value: 'voucher_basicpack',
  },
  {
    icon: imgResources('reagent_c_t01.png'),
    label: 'Pure Drop Of Rain',
    value: 'reagent_c_t01',
  },
  {
    icon: imgResources('reagent_c_t02.png'),
    label: 'Lightning In A Bottle',
    value: 'reagent_c_t02',
  },
  {
    icon: imgResources('reagent_c_t03.png'),
    label: 'Eye Of The Storm',
    value: 'reagent_c_t03',
  },
  {
    icon: imgResources('reagent_c_t04.png'),
    label: 'Storm Shard',
    value: 'reagent_c_t04',
  },
  {
    icon: imgResources('heroxp.png'),
    label: 'Hero XP',
    value: 'heroxp',
  },
  {
    icon: imgResources('schematicxp.png'),
    label: 'Schematic XP',
    value: 'schematicxp',
  },
  {
    icon: imgResources('personnelxp.png'),
    label: 'Survivor XP',
    value: 'personnelxp',
  },
  {
    icon: imgResources('reagent_alteration_upgrade_sr.png'),
    label: 'Legendary Perk Up',
    value: 'reagent_alteration_upgrade_sr',
  },
  {
    icon: imgResources('reagent_alteration_upgrade_vr.png'),
    label: 'Epic Perk Up',
    value: 'reagent_alteration_upgrade_vr',
  },
  {
    icon: imgResources('reagent_alteration_upgrade_r.png'),
    label: 'Rare Perk Up',
    value: 'reagent_alteration_upgrade_r',
  },
  {
    icon: imgResources('reagent_alteration_upgrade_uc.png'),
    label: 'Uncommon Perk Up',
    value: 'reagent_alteration_upgrade_uc',
  },
  {
    icon: imgResources('reagent_alteration_ele_fire.png'),
    label: 'FIRE-UP!',
    value: 'reagent_alteration_ele_fire',
  },
  {
    icon: imgResources('reagent_alteration_ele_nature.png'),
    label: 'AMP-UP!',
    value: 'reagent_alteration_ele_nature',
  },
  {
    icon: imgResources('reagent_alteration_ele_water.png'),
    label: 'FROST-UP!',
    value: 'reagent_alteration_ele_water',
  },
  {
    icon: imgResources('reagent_alteration_generic.png'),
    label: 'RE-PERK!',
    value: 'reagent_alteration_generic',
  },
]
