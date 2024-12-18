import type { ConfigType } from 'dayjs'

import dayjs from 'dayjs'

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
  return getDateWithFormat(config, 'dddd, MMMM D, YYYY h:mm:ss A')
}

export function getShortDateFormat(config?: ConfigType) {
  return getDateWithFormat(config, 'ddd, MMM D, YYYY h:mm:ss A')
}
