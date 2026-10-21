export function utcDateString(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function shiftUtcDate(date: string, days: number) {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  utc.setUTCDate(utc.getUTCDate() + days)
  return utc.toISOString().slice(0, 10)
}

export function getWorldInfoMissionDay(data: {
  missions?: Array<{ nextRefresh?: string }>
  missionAlerts?: Array<{ nextRefresh?: string }>
} | null | undefined) {
  const next =
    data?.missions?.[0]?.nextRefresh ??
    data?.missionAlerts?.[0]?.nextRefresh

  if (typeof next === 'string' && /^\d{4}-\d{2}-\d{2}/.test(next)) {
    return shiftUtcDate(next.slice(0, 10), -1)
  }

  return utcDateString()
}
