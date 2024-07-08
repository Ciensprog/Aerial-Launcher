import type { ConfigType } from 'dayjs'

import dayjs from 'dayjs'

export function getDate(config?: ConfigType) {
  return dayjs(config).format('YYYY-MM-DD')
}

export function toDate(config?: ConfigType) {
  return dayjs(config).toDate()
}

export function relativeTime(config?: ConfigType) {
  return dayjs(config).fromNow()
}
