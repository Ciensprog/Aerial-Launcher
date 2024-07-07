import {
  useCurrentWorldInfoActions,
  useCurrentWorldInfoData,
} from '../../../hooks/advanced-mode/world-info'

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

export function useCurrentActions() {
  const { setIsFetching } = useCurrentWorldInfoActions()
  const { isFetching } = useCurrentWorldInfoData()

  const handleRefetch = () => {
    if (isFetching) {
      return
    }

    setIsFetching(true)
    window.electronAPI.requestWorldInfoData()
  }

  return {
    handleRefetch,
  }
}
