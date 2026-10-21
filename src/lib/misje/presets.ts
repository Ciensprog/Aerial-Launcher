import dayjs from 'dayjs'

export const DEFAULT_SWAP_DISPLAY_NAME = 'Selling Cheap V Bucks'

export type ProcessOptions = {
  changeTheater: boolean
  replacePhrases: boolean
  changeDisplayName: boolean
  changeDifficulty: boolean
}

function todayPrefix() {
  return dayjs().format('DD.MM')
}

export const MISJE_PRESETS = {
  normalFilePlus: {
    label: 'Normal File :)',
    filename: () => `${todayPrefix()}.json`,
    options: { changeTheater: true, replacePhrases: true, changeDisplayName: true, changeDifficulty: false },
  },
  normalFile: {
    label: 'Normal File',
    filename: () => `${todayPrefix()}.json`,
    options: { changeTheater: true, replacePhrases: true, changeDisplayName: false, changeDifficulty: false },
  },
  defaultFilePlus: {
    label: 'Default File :)',
    filename: () => `${todayPrefix()}default.json`,
    options: { changeTheater: false, replacePhrases: false, changeDisplayName: true, changeDifficulty: false },
  },
  defaultFile: {
    label: 'Default File',
    filename: () => `${todayPrefix()}Default.json`,
    options: { changeTheater: false, replacePhrases: false, changeDisplayName: false, changeDifficulty: false },
  },
  dupeFile: {
    label: 'DUPE File :)',
    filename: () => `${todayPrefix()}dupe.json`,
    options: { changeTheater: true, replacePhrases: true, changeDisplayName: true, changeDifficulty: true },
  },
} as const

export type MisjePresetId = keyof typeof MISJE_PRESETS