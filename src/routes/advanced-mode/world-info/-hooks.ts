import { useCurrentWorldInfoData } from '../../../hooks/advanced-mode/world-info'

import { dateNow } from '../../../lib/dates'

export function useData() {
  const { data, isFetching } = useCurrentWorldInfoData()
  const currentData = {
    date: dateNow(),
    value: data,
  }

  return {
    currentData,
    isFetching,
  }
}
