import { Trans } from 'react-i18next'
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
    <div className="bg-muted-foreground/5 -mt-4 -mx-4 lg:-mt-6 lg:-mx-6">
      <div className="max-w-[90%] mx-auto px-5 py-2 text-center w-full">
        <h1 className="text-balance">
          <Trans
            ns="general"
            i18nKey="community-info.message"
          >
            Join our{' '}
            <a
              href={supportDiscordServerURL}
              className="gap-1 inline-flex items-center text-muted-foreground underline underline-offset-2 hover:opacity-70"
              onClick={handleOpenDiscord}
              onAuxClick={whatIsThis()}
            >
              Discord Community
              <ExternalLinkIcon className="relative top-0.5" />
            </a>{' '}
            to know more about what's coming on next updates!!!
          </Trans>
        </h1>
      </div>
    </div>
  )
}
