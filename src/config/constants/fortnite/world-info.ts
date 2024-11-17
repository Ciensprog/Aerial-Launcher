export enum World {
  // Base
  Stonewood = '33A2311D4AE64B361CCE27BC9F313C8B',
  Plankerton = 'D477605B4FA48648107B649CE97FCF27',
  CannyValley = 'E6ECBD064B153234656CB4BDE6743870',
  TwinePeaks = 'D9A801C5444D1C74D1B7DAB5C7C12C5B',

  // Events
  Dungeons = '394D85EF40B2BF401E6F32B587D7672B',

  // Ventures
  Hexsylvania = 'DBB6E92A4EDE30B76C94C7BA3852C473',

  // Extras
  PerfMem = '67EDCFE942260C290B369BA7AA70A0D5',
  Tutorial = '8633333E41A86F67F78EAEAF25BF4735',
}

export enum WorldColor {
  Stonewood = 'var(--zone-color-stonewood)',
  Plankerton = 'var(--zone-color-plankerton)',
  CannyValley = 'var(--zone-color-canny-valley)',
  TwinePeaks = 'var(--zone-color-twine-peaks)',

  Ventures = 'var(--zone-color-ventures)',
}

export enum WorldLetter {
  Stonewood = 'S',
  Plankerton = 'P',
  CannyValley = 'C',
  TwinePeaks = 'T',
  Ventures = 'V',
}

export enum WorldStormKingZone {
  CannyValley = 'Hard_Zone5_Dudebro',
  TwinePeaks = 'Nightmare_Zone10_Dudebro',
}

export const defaultWorldInfo = {
  missionAlerts: [],
  missions: [],
  theaters: [],
}

export const worldInfoOrdering: Record<
  Extract<
    World,
    | World.Stonewood
    | World.Plankerton
    | World.CannyValley
    | World.TwinePeaks
  >,
  number
> = {
  [World.Stonewood]: 4,
  [World.Plankerton]: 3,
  [World.CannyValley]: 2,
  [World.TwinePeaks]: 1,
}

export const worldName: Record<
  Exclude<WorldLetter, WorldLetter.Ventures>,
  string
> = {
  [WorldLetter.Stonewood]: 'Stonewood',
  [WorldLetter.Plankerton]: 'Plankerton',
  [WorldLetter.CannyValley]: 'Canny Valley',
  [WorldLetter.TwinePeaks]: 'Twine Peaks',
}

export const worldNameByTheaterId: Record<
  Extract<
    World,
    | World.Stonewood
    | World.Plankerton
    | World.CannyValley
    | World.TwinePeaks
  >,
  string
> = {
  [World.Stonewood]: 'Stonewood',
  [World.Plankerton]: 'Plankerton',
  [World.CannyValley]: 'Canny Valley',
  [World.TwinePeaks]: 'Twine Peaks',
}

export const zoneColors: Record<string, string> = {
  [World.Stonewood]: WorldColor.Stonewood,
  [World.Plankerton]: WorldColor.Plankerton,
  [World.CannyValley]: WorldColor.CannyValley,
  [World.TwinePeaks]: WorldColor.TwinePeaks,
}

export const zoneLetters: Record<string, string> = {
  [World.Stonewood]: WorldLetter.Stonewood,
  [World.Plankerton]: WorldLetter.Plankerton,
  [World.CannyValley]: WorldLetter.CannyValley,
  [World.TwinePeaks]: WorldLetter.TwinePeaks,
}

export const worldPowerLevel = {
  [World.Stonewood]: {
    Start_Zone1: 1,
    Start_Zone2: 3,
    Start_Zone3: 5,
    Start_Zone4: 9,
    Start_Zone5: 15,
    Normal_Zone1: 19,
  },
  [World.Plankerton]: {
    Normal_Zone1: 19,
    Normal_Zone2: 23,
    Normal_Zone3: 28,
    Normal_Zone4: 34,
    Normal_Zone5: 40,
    Hard_Zone1: 46,
  },
  [World.CannyValley]: {
    Hard_Zone1: 46,
    Hard_Zone2: 52,
    Hard_Zone3: 58,
    Hard_Zone4: 64,
    Hard_Zone5: 70,
  },
  [World.TwinePeaks]: {
    Nightmare_Zone1: 76,
    Nightmare_Zone2: 82,
    Nightmare_Zone3: 88,
    Nightmare_Zone4: 94,
    Nightmare_Zone5: 100,
    Endgame_Zone1: 108,
    Endgame_Zone2: 116,
    Endgame_Zone3: 124,
    Endgame_Zone4: 132,
    Endgame_Zone5: 140,
    Endgame_Zone6: 160,
  },
  ventures: {
    Phoenix_Zone02: 3,
    Phoenix_Zone03: 5,
    Phoenix_Zone05: 15,
    Phoenix_Zone07: 23,
    Phoenix_Zone09: 34,
    Phoenix_Zone11: 46,
    Phoenix_Zone13: 58,
    Phoenix_Zone15: 70,
    Phoenix_Zone17: 82,
    Phoenix_Zone19: 94,
    Phoenix_Zone21: 108,
    Phoenix_Zone23: 124,
    Phoenix_Zone25: 140,
  },
} as const

export const zonesCategories = {
  quest: [
    '1stTrapTheStorm',
    'BuildOff',
    'Day1_C',
    'Day18257',
    'DeployTheProbe',
    'DtM',
    'StabilizeTheRift',
    'FightTheGunslinger',
    'HotelHuskEscape',
    'Landmark',
    'PlankHarbor3Gate',
    'PtS',
    'StC',
    'StormQuest2018Landmark',
    'TestTheSuit',
    'VindermanMansion',
    'WatchTheSkies',
  ],
  atlas: ['1Gate', 'Cat1FtS', 'GateSingle'],
  'atlas-c2': ['2Gates'],
  'atlas-c3': ['3Gates'],
  'atlas-c4': ['4Gates'],
  dtb: ['DtB'],
  dte: ['DestroyTheEncampments', 'DtE'],
  eac: ['EliminateAndCollect'],
  ets: ['EtS_C', 'EtShelter', 'EvacuateTheSurvivors'],
  'mini-boss': ['DUDEBRO'],
  htm: ['HTM_C'], // Haunt The Titan (Beta Storm)
  htr: ['HitTheRoad', 'Mayday'],
  radar: ['BuildtheRadarGrid'],
  refuel: ['RefuelTheBase'],
  rescue: ['EtSurvivors'],
  resupply: ['Resupply'],
  rocket: ['LtR'],
  rtd: ['RetrieveTheData', 'RtD'],
  rtl: ['LaunchTheBalloon', 'LtB', 'RideTheLightning', 'RtL'],
  rts: ['PowerTheStormShield', 'RtS'],
  stn: ['SurviveTheNight'],
  'storm-shield': ['Outpost'],
  tts: ['TrapTheStorm'],
}

export const zonesGroups: Array<keyof typeof zonesCategories> = [
  'atlas',
  'atlas-c2',
  'atlas-c3',
  'atlas-c4',
  'dtb',
  'ets',
  'rtd',
  'rtl',
  'rts',
]

export enum VentureModifier {
  /**
   * @venture Hexsylvania
   * @title Short Range
   * @description Enemies close to a player or defender suffer more damage; those far away suffer less. All enemies have a chance to drop a healing pickup when eliminated.
   */
  ShortRange = 'GM_Phoenix_CloseQuarters',
}

export enum WorldModifier {
  FireStorm = 'elementalzonefireenableitem',
  NatureStorm = 'elementalzonenatureenableitem',
  IceStorm = 'elementalzonewaterenableitem',

  ExplodingDeathbomb = 'gm_basehusk_ondeath_explode',
  MetalCorrosion = 'gm_basehusk_ondmgdealt_metalcorrosion',
  UnchartedEnemies = 'gm_enemy_hideonminimap',
  FrenziedDeathburst = 'gm_enemy_ondeath_applyspeedmods',
  HealingDeathburst = 'gm_enemy_ondeath_areaheal',
  AcidPools = 'gm_enemy_ondeath_spawndamagepool',
  SmokeScreens = 'gm_enemy_ondeath_spawnenemyrangeresistpool',
  SlowingPools = 'gm_enemy_ondeath_spawnplayerslowpool',
  SlowingAttacks = 'gm_enemy_ondmgdealt_slowdownfoe',
  LifeLeechAttacks = 'gm_enemy_ondmgdealt_lifeleech',
  Quickened = 'gm_enemy_ondmgreceived_speedbuff',
  WallWeakening = 'gm_enemy_onhitweakenbuildings',
  EpicMiniBoss = 'minibossenableprimarymissionitem',

  BuildingConstructors = 'gm_constructor_buildcost_buff',
  AdeptConstructors = 'gm_constructor_damage_buff',
  FocusedNinjas = 'gm_ninja_abilityrate_buff',
  AdeptNinjas = 'gm_ninja_damage_buff',
  LeapingNinjas = 'gm_ninja_jumpheight_buff',
  SwordNinjas = 'gm_ninja_sword_damagebuff',
  AdeptOutlander = 'gm_outlander_damage_buff',
  UpgradedOutlanders = 'gm_outlander_tech_buff',
  WellDrilledSoldiers = 'gm_soldier_abilityrate_buff',
  HeadshotSoldiers = 'gm_soldier_assaultrifle_buff',
  AdepSoldier = 'gm_soldier_damage_buff',
  AdeptAbilities = 'gm_hero_tech_buff',
  PowerfulTraps = 'gm_trap_buff',

  PowerfulAssaultRiffles = 'gm_player_assaultrifle_damage_buff',
  PowerfulAxesAndScythes = 'gm_player_axesscythesdamage_buff',
  PowerfulClubsAndHardware = 'gm_player_bluntdamage_buff',
  PowerfulEnergyAttacks = 'gm_player_energy_damagebuff',
  PowerfulExplosives = 'gm_player_explosive_damagebuff',
  KnockbackMeleeAttacks = 'gm_player_meleeknockback_buff',
  MeleeLifeLeech = 'gm_player_ondmgdealt_lifeleech',
  ConcussiveShieldbreak = 'gm_player_onshielddestroyed_aoe',
  PowerfulPistols = 'gm_player_pistol_damagebuff',
  PowerfulShotguns = 'gm_player_shotgun_damagebuff',
  PowerfulSMGs = 'gm_player_smg_damage_buff',
  PowerfulSniperRifles = 'gm_player_sniperrifle_damagebuff',
  PowerfulSwordsAndSpears = 'gm_player_spearsworddamage_buff',
}

export const adventureModifiers = [VentureModifier.ShortRange]

export const modifiersAvailable = [
  WorldModifier.FireStorm,
  WorldModifier.NatureStorm,
  WorldModifier.IceStorm,

  WorldModifier.ExplodingDeathbomb,
  WorldModifier.MetalCorrosion,
  WorldModifier.UnchartedEnemies,
  WorldModifier.FrenziedDeathburst,
  WorldModifier.HealingDeathburst,
  WorldModifier.AcidPools,
  WorldModifier.SmokeScreens,
  WorldModifier.SlowingPools,
  WorldModifier.SlowingAttacks,
  WorldModifier.LifeLeechAttacks,
  WorldModifier.Quickened,
  WorldModifier.WallWeakening,
  WorldModifier.EpicMiniBoss,

  WorldModifier.BuildingConstructors,
  WorldModifier.AdeptConstructors,
  WorldModifier.FocusedNinjas,
  WorldModifier.AdeptNinjas,
  WorldModifier.LeapingNinjas,
  WorldModifier.SwordNinjas,
  WorldModifier.AdeptOutlander,
  WorldModifier.UpgradedOutlanders,
  WorldModifier.WellDrilledSoldiers,
  WorldModifier.HeadshotSoldiers,
  WorldModifier.AdepSoldier,
  WorldModifier.AdeptAbilities,
  WorldModifier.PowerfulTraps,

  WorldModifier.PowerfulAssaultRiffles,
  WorldModifier.PowerfulAxesAndScythes,
  WorldModifier.PowerfulClubsAndHardware,
  WorldModifier.PowerfulEnergyAttacks,
  WorldModifier.PowerfulExplosives,
  WorldModifier.KnockbackMeleeAttacks,
  WorldModifier.MeleeLifeLeech,
  WorldModifier.ConcussiveShieldbreak,
  WorldModifier.PowerfulPistols,
  WorldModifier.PowerfulShotguns,
  WorldModifier.PowerfulSMGs,
  WorldModifier.PowerfulSniperRifles,
  WorldModifier.PowerfulSwordsAndSpears,
]
