import type { MouseEventHandler } from 'react'

import { useEffect, useState } from 'react'

export function useCheckNewVersion() {
  const [data, setData] = useState<{
    link: string
    version: string
  } | null>(null)

  useEffect(() => {
    const listener = window.electronAPI.responseNewVersionStatus(
      async (data) => {
        if (data) {
          setData(data)
        }
      }
    )

    window.electronAPI.requestNewVersionStatus()

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleGoToNewRelease: MouseEventHandler = (event) => {
    event.preventDefault()

    if (data) {
      window.electronAPI.openExternalURL(data.link)
    }
  }

  return {
    data,

    handleGoToNewRelease,
  }
}
