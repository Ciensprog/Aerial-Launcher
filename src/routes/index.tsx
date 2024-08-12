import type { MouseEventHandler } from 'react'

import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
// import { ExternalLink } from 'lucide-react'

import { supportDiscordServerURL } from '../config/about/links'

import { CheckNewVersion } from '../bootstrap/components/check-new-version'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '../components/ui/breadcrumb'

import { Route as RootRoute } from './__root'

import { whatIsThis } from '../lib/callbacks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: IndexComponent,
})

export function IndexComponent() {
  const handleOpenDiscord: MouseEventHandler = (event) => {
    event.preventDefault()

    window.electronAPI.openExternalURL(supportDiscordServerURL)
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CheckNewVersion />
      <div className="flex flex-grow">
        <div className="flex flex-col items-center justify-center w-full">
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
        </div>
      </div>
    </>
  )
}
