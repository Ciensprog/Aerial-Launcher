import type { MouseEvent } from 'react'

import { Link, createRoute } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'

import packageJson from '../../../../package.json'

import { Route as RootRoute } from '../../__root'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'

import { cn } from '../../../lib/utils'

const links = {
  kuda: 'https://www.youtube.com/@kuda9098',
  LeleDerGrasshalmi:
    'https://github.com/LeleDerGrasshalmi/FortniteEndpointsDocumentation',
  HyperionCSharp: 'https://github.com/HyperionCSharp/EpicGamesAPIDocs',
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/information/credits',
  component: ComponentRoute,
})

export function ComponentRoute() {
  const openURL = (url: string) => (event: MouseEvent) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(url)
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Credits</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-grow">
        <div className="flex items-center- justify-center- w-full">
          <div className="flex flex-col max-w-md">
            <ul
              className={cn(
                'space-y-5 w-full',
                '[&_.link]:gap-1 [&_.link]:inline-flex [&_.link]:items-center [&_.link]:text-muted-foreground [&_.link:hover]:text-muted-foreground/80'
              )}
            >
              <li className="item">
                <a
                  href={packageJson.repository.url}
                  className="link"
                  onClick={openURL(packageJson.repository.url)}
                >
                  Ciensprog <ExternalLink className="h-3 w-3" />
                </a>
                <div className="">
                  The one and only developer of Aerial Launcher.
                </div>
              </li>
              <li className="item">
                <a
                  href={links.kuda}
                  className="link"
                  onClick={openURL(links.kuda)}
                >
                  Kuda <ExternalLink className="h-3 w-3" />
                </a>
                <div className="">
                  Helped with the logos, design and suggested many cool
                  features along the way.
                </div>
              </li>
              <li className="item">
                <a
                  href={links.LeleDerGrasshalmi}
                  className="link"
                  onClick={openURL(links.LeleDerGrasshalmi)}
                >
                  LeleDerGrasshalmi <ExternalLink className="h-3 w-3" />
                </a>{' '}
                and{' '}
                <a
                  href={links.HyperionCSharp}
                  className="link"
                  onClick={openURL(links.HyperionCSharp)}
                >
                  HyperionCSharp <ExternalLink className="h-3 w-3" />
                </a>
                <div className="">
                  Their endpoint list helped me a lot during the
                  development.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
