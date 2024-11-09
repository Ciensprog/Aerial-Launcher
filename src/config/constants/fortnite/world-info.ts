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
  // Base
  Stonewood = '#34d375',
  Plankerton = '#39a5f1',
  CannyValley = '#dfa12a',
  TwinePeaks = '#ff7c53',

  // Base
  Ventures = '#bfbaba',
}

export enum WorldLetter {
  Stonewood = 'S',
  Plankerton = 'P',
  CannyValley = 'C',
  TwinePeaks = 'T',
}

export const worldName: Record<WorldLetter, string> = {
  [WorldLetter.Stonewood]: 'Stonewood',
  [WorldLetter.Plankerton]: 'Plankerton',
  [WorldLetter.CannyValley]: 'Canny Valley',
  [WorldLetter.TwinePeaks]: 'Twine Peaks',
}
