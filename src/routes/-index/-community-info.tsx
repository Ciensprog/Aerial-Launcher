// import { Trans } from 'react-i18next'
import type { MouseEventHandler, ReactNode } from 'react'

// import { ExternalLinkIcon } from '@radix-ui/react-icons'

import { images } from '../../images'

import { whatIsThis } from '../../lib/callbacks'
import { cn } from '../../lib/utils'

const information: Array<{
  url: string
  text?: string
  imageUrl?: ReactNode
}> = [
  {
    url: 'https://ko-fi.com/ciensprog',
    imageUrl: images['ko-fi'],
  },
  {
    url: 'https://discord.gg/byKYEJBFrt',
    text: 'Discord',
    imageUrl: (
      <svg
        className="ml-1 size-3.5 text-white"
        viewBox="0 0 256 199"
        width="256"
        height="199"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid"
      >
        <path
          d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    url: 'https://stw.news/',
    text: 'STW News',
    imageUrl: images['aerial-stwnews'],
  },
  {
    url: 'https://discord.gg/XbGSTuXZdy',
    text: 'ML Corp',
    imageUrl: images['aerial-ml-corp'],
  },
]

export function CommunityInfo() {
  const handleOpenLink =
    (url: string): MouseEventHandler =>
    (event) => {
      event.preventDefault()

      window.electronAPI.openExternalURL(url)
    }

  return (
    <section
      className="bg-muted-foreground/5 -mt-4 -mx-4 lg:-mt-6 lg:-mx-6"
      aria-label="support and projects"
    >
      <div className="flex flex-col gap-1 justify-center mx-auto max-w-lg py-2 w-full">
        <ul className="flex gap-1 items-center mx-auto">
          {information.map((link, index) => (
            <li
              className=""
              key={index}
            >
              <a
                href={link.url}
                className="border-2 border-transparent flex font-medium gap-2 h-9 items-center pl-1.5 pr-2.5 py-1 rounded text-base transition-colors hover:bg-secondary"
                onClick={handleOpenLink(link.url)}
                onAuxClick={whatIsThis()}
              >
                {link.imageUrl &&
                  (typeof link.imageUrl === 'string' ? (
                    <img
                      src={link.imageUrl}
                      className={cn('flex-shrink-0', {
                        'size-6': link.text,
                        'h-5 px-1.5': !link.text,
                      })}
                      alt="icon"
                    />
                  ) : (
                    link.imageUrl
                  ))}
                {link.text && <span className="-mt-1">{link.text}</span>}
              </a>
            </li>
          ))}
        </ul>
        {/* <h1 className="text-balance">
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
        </h1> */}
      </div>
    </section>
  )
}
