import type { ConfigType } from 'dayjs'

import dayjs from 'dayjs'

import { Language } from '../locales/resources'

export function changeDateLocale(language: Language) {
  const locales: Partial<Record<Language, () => void>> = {
    [Language.Spanish]: () => dayjs.locale('es'),
  }
  const current = locales[language]

  if (current !== undefined) {
    return current()
  }

  dayjs.locale('en')
}

export function getDate(config?: ConfigType) {
  return dayjs(config).format('YYYY-MM-DD')
}

export function getDateWithDefaultFormat(config?: ConfigType) {
  return dayjs(config).format()
}

export function getRawDate(config?: ConfigType) {
  return dayjs(config)
}

export function getRawDateWithTZ(config?: ConfigType) {
  return dayjs.tz(config, dayjs.tz.guess())
}

export function toDate(config?: ConfigType) {
  return dayjs(config).toDate()
}

export function getDateWithFormat(config: ConfigType, template: string) {
  return dayjs(config).format(template)
}

export function relativeTime(config?: ConfigType) {
  return dayjs(config).fromNow()
}

export function getExtendedDateFormat(config?: ConfigType) {
  return getDateWithFormat(config, 'dddd, MMMM D, YYYY HH:mm:ss')
}

export function getShortDateFormat(config?: ConfigType) {
  return getDateWithFormat(config, 'ddd, MMM D, YYYY HH:mm:ss')
}

/** Next local calendar date of a weekday (0 Sunday … 6 Saturday), including today. */
export function nextWeekdayDate(weekday: number, config?: ConfigType) {
  const date = dayjs(config).startOf('day')
  const delta = (weekday - date.day() + 7) % 7

  return date.add(delta, 'day').toDate()
}
