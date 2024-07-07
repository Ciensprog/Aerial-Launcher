import { useEffect } from 'react'

import { useCurrentWorldInfoActions } from '../../../hooks/advanced-mode/world-info'

export function LoadWorldInfoData() {
  const { setData, setIsFetching } = useCurrentWorldInfoActions()

  useEffect(() => {
    const listener = window.electronAPI.responseWorldInfoData(
      async (response) => {
        setData(response.data)
        setIsFetching(false)
      }
    )

    setIsFetching(true)
    window.electronAPI.requestWorldInfoData()

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
