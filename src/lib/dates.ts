import dayjs from 'dayjs'

export function dateNow() {
  return dayjs().format('YYYY-MM-DD')
}
