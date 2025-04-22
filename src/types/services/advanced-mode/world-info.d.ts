import { StringUnion } from '../../utils.d'

export type WorldInfoData = {
  missionAlerts: Array<{
    availableMissionAlerts: Array<{
      name: string
      categoryName: string
      spreadDataName: string
      missionAlertGuid: string
      tileIndex: number
      availableUntil: string
      totalSpreadRefreshes: number
      missionAlertRewards: {
        tierGroupName: string
        items: Array<{
          attributes?: {
            Alteration?: Partial<{
              LootTierGroup: string
              Tier: number
            }>
          }
          itemType: string
          quantity: number
        }>
      }
      missionAlertModifiers: {
        tierGroupName: string
        items: Array<{
          itemType: string
          quantity: number
        }>
      }
    }>
    nextRefresh: string
    theaterId: string
  }>
  missions: Array<{
    availableMissions: Array<{
      missionGuid: string
      missionRewards: {
        tierGroupName: string
        items: Array<{
          itemType: string
          quantity: number
        }>
      }
      overrideMissionRewards: Record<string, unknown>
      missionGenerator: string
      missionDifficultyInfo: {
        dataTable: string
        rowName: string
      }
      tileIndex: number
      availableUntil: string
    }>
    nextRefresh: string
    theaterId: string
  }>
  theaters: Array<{
    displayName: Record<AvailableLocales, string>
    uniqueId: string
    theaterSlot: number
    theaterUIOrder: number
    bIsTestTheater: boolean
    bHideLikeTestTheater: boolean
    requiredEventFlag: string
    missionRewardNamedWeightsRowName: string
    description: Record<AvailableLocales, string>
    runtimeInfo: {
      theaterType: string
      theaterTags: Tags
      eventDependentTheaterTags: Array<{
        requiredEventFlag: string
        relatedTag: Tag
      }>
      theaterVisibilityRequirements: Requirements
      requirements: Requirements
      requiredSubGameForVisibility: string
      bOnlyMatchLinkedQuestsToTiles: boolean
      worldMapPinClass: string
      theaterImage: string
      theaterImages: {
        brush_XXS: Brush
        brush_XS: Brush
        brush_S: Brush
        brush_M: Brush
        brush_L: Brush
        brush_XL: Brush
      }
      theaterColorInfo: unknown
      socket: string
      missionAlertRequirements: Requirements
      missionAlertCategoryRequirements: Array<MissionAlertCategoryRequirement>
      gameplayModifierList: Array<GameplayModifierList>
    }
    tiles: Array<Tile>
    regions: Array<Region>
  }>
}

export type AvailableLocales =
  | 'de'
  | 'ru'
  | 'ko'
  | 'pt-br'
  | 'en'
  | 'it'
  | 'fr'
  | 'es'
  | 'ar'
  | 'ja'
  | 'pl'
  | 'es-419'
  | 'tr'

export type Brush = {
  bIsDynamicallyLoaded: boolean
  drawAs: string
  tiling: string
  mirroring: string
  imageType: string
  imageSize: ImageSize
  margin: {
    left: number
    top: number
    right: number
    bottom: number
  }
  tintColor: Color
  outlineSettings: {
    cornerRadii: {
      x: number
      y: number
      z: number
      w: number
    }
    color: Color
    width: number
    roundingType: string
    bUseBrushTransparency: boolean
  }
  resourceObject: string
  resourceName: RegionThemeIcon
  uVRegion: {
    min: ImageSize
    max: ImageSize
    bIsValid: boolean
  }
}

export type Color = {
  specifiedColor: {
    r: number
    g: number
    b: number
    a: number
  }
  colorUseRule: StringUnion<'UseColor_Specified'>
}

export type DifficultyWeight = {
  difficultyInfo: ObjectiveStatHandle
  weight: number
}

export type GameplayModifierList = {
  eventFlagName: string
  gameplayModifier: string
}

export type ImageSize = {
  x: number
  y: number
}

export type LinkedQuest = {
  questDefinition: string
  objectiveStatHandle: ObjectiveStatHandle
}

export type MissionAlertCategoryRequirement = {
  missionAlertCategoryName: string
  bRespectTileRequirements: boolean
  bAllowQuickplay: boolean
}

export type MissionWeight = {
  weight: number
  missionGenerator: string
}

export type ObjectiveStatHandle = {
  dataTable: string
  rowName: string
}

export type Region = {
  displayName: Record<AvailableLocales, string>
  uniqueId: string
  regionTags: Tags
  tileIndices: Array<number>
  regionThemeIcon: RegionThemeIcon
  missionData: {
    missionWeights: Array<MissionWeight>
    difficultyWeights: Array<DifficultyWeight>
    numMissionsAvailable: number
    numMissionsToChange: number
    missionChangeFrequency: number
  }
  requirements: Requirements
  missionAlertRequirements: Array<unknown>
}

export type RegionThemeIcon = StringUnion<'None'>

export type Requirements = {
  commanderLevel: number
  personalPowerRating: number
  maxPersonalPowerRating: number
  partyPowerRating: number
  maxPartyPowerRating: number
  activeQuestDefinitions: Array<string>
  questDefinition: string
  objectiveStatHandle: ObjectiveStatHandle
  uncompletedQuestDefinition: RegionThemeIcon
  itemDefinition: RegionThemeIcon
  eventFlag: string
}

export type Tags = {
  gameplayTags: Array<Tag>
}

export type Tag = {
  tagName: string
}

export type Tile = {
  tileType: StringUnion<'AlwaysActive' | 'NonMission' | 'Normal'>
  zoneTheme: string
  requirements: Requirements
  linkedQuests: Array<LinkedQuest>
  xCoordinate: number
  yCoordinate: number
  missionWeightOverrides: Array<MissionWeight>
  difficultyWeightOverrides: Array<unknown>
  canBeMissionAlert: boolean
  tileTags: Tags
  bDisallowQuickplay: boolean
}
