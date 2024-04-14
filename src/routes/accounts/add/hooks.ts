import type { MouseEventHandler } from 'react'

import { epicGamesAuthorizationCodeURL } from '../../../config/fortnite/links'

export function useHandlers() {
  const goToAuthorizationCodeURL: MouseEventHandler<HTMLAnchorElement> = (
    event
  ) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(epicGamesAuthorizationCodeURL)
  }

  return {
    goToAuthorizationCodeURL,
  }
}
