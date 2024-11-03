import type { MouseEventHandler } from 'react'

import { ExternalLinkIcon } from '@radix-ui/react-icons'

import { supportDiscordServerURL } from '../../config/about/links'

import { whatIsThis } from '../../lib/callbacks'

export function CommunityInfo() {
  const handleOpenDiscord: MouseEventHandler = (event) => {
    event.preventDefault()

    window.electronAPI.openExternalURL(supportDiscordServerURL)
  }

  return (
    <div className="max-w-[330px] w-full">
      <h1 className="text-center">
        Join our{' '}
        <a
          href="/"
          className="gap-1 inline-flex items-center text-muted-foreground underline underline-offset-2 hover:opacity-70"
          onClick={handleOpenDiscord}
          onAuxClick={whatIsThis()}
        >
          Discord Community
          <ExternalLinkIcon className="relative top-0.5" />
        </a>{' '}
        to know more about what's coming on next updates!!!
      </h1>
    </div>
  )
}
