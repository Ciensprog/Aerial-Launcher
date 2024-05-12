import { useEffect } from 'react'

import { useTagsStore } from '../../state/settings/tags'

export function LoadTags() {
  const updateTags = useTagsStore((state) => state.updateTags)

  useEffect(() => {
    const listener = window.electronAPI.responseTags(async (tags) => {
      updateTags(tags)
    })

    window.electronAPI.requestTags()

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
