import { useEffect } from 'react'

import { useWorldInfoFilesActions } from '../../../hooks/advanced-mode/world-info'

export function LoadWorldInfoFiles() {
  const { setFiles } = useWorldInfoFilesActions()

  useEffect(() => {
    const listener = window.electronAPI.responseWorldInfoFiles(
      async (response) => {
        setFiles(response)
      }
    )

    window.electronAPI.requestWorldInfoFiles()

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
