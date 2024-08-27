import type { ConfigType } from 'dayjs'

import dayjs from 'dayjs'

export function getDate(config?: ConfigType) {
  return dayjs(config).format('YYYY-MM-DD')
}

export function getRawDate(config?: ConfigType) {
  return dayjs(config).format()
}

export function toDate(config?: ConfigType) {
  return dayjs(config).toDate()
}

export function dateWithFormat(config: ConfigType, template: string) {
  return dayjs(config).format(template)
}

export function relativeTime(config?: ConfigType) {
  return dayjs(config).fromNow()
}
