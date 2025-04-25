import type { MouseEvent } from 'react'

import { createRoute } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import packageJson from '../../../../package.json'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'

import { useActions } from './-hooks'

import { whatIsThis } from '../../../lib/callbacks'
import { cn } from '../../../lib/utils'

const links = {
  kuda: 'https://www.youtube.com/@kuda9098',
  LeleDerGrasshalmi:
    'https://github.com/LeleDerGrasshalmi/FortniteEndpointsDocumentation',
  HyperionCSharp: 'https://github.com/HyperionCSharp/EpicGamesAPIDocs',
  eric_guest1: '',
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/information/credits',
  component: ComponentRoute,
})

export function ComponentRoute() {
  const { t } = useTranslation(['general'])

  const { handleEricDejaDeJoder, handleFreshAttrs, handleSick } =
    useActions()

  const openURL = (url: string) => (event: MouseEvent) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(url)
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <HomeBreadcrumb />
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('credits')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-grow">
        <div className="flex w-full">
          <div
            className={cn(
              'flex flex-col max-w-md mb-5',
              '[&_.list]:space-y-5 [&_.list]:w-full',
              '[&_.link]:gap-1 [&_.link]:inline-flex [&_.link]:items-center [&_.link]:text-muted-foreground [&_.link:hover]:text-muted-foreground/80'
            )}
          >
            <h2 className="mb-5 text-3xl">Credits</h2>
            <ul className="list">
              <li className="item">
                <a
                  href={packageJson.repository.url}
                  className="link"
                  onClick={openURL(packageJson.repository.url)}
                  onAuxClick={whatIsThis()}
                >
                  Ciensprog <ExternalLink className="h-3 w-3" />
                </a>
                <div>The one and only developer of Aerial Launcher.</div>
              </li>
              <li className="item">
                <a
                  href={links.kuda}
                  className="link"
                  onClick={openURL(links.kuda)}
                  onAuxClick={whatIsThis()}
                >
                  Kuda <ExternalLink className="h-3 w-3" />
                </a>
                <div>
                  Helped with the logos, design and suggested many cool
                  features along the way. Lleva meses con la misma{' '}
                  <span onClick={handleSick}>tos ☠️</span>
                </div>
              </li>
              <li className="item">
                <a
                  href={links.LeleDerGrasshalmi}
                  className="link"
                  onClick={openURL(links.LeleDerGrasshalmi)}
                  onAuxClick={whatIsThis()}
                >
                  LeleDerGrasshalmi <ExternalLink className="h-3 w-3" />
                </a>{' '}
                and{' '}
                <a
                  href={links.HyperionCSharp}
                  className="link"
                  onClick={openURL(links.HyperionCSharp)}
                  onAuxClick={whatIsThis()}
                >
                  HyperionCSharp <ExternalLink className="h-3 w-3" />
                </a>
                <div>
                  Their endpoint list helped me a lot during the
                  development.
                </div>
              </li>
            </ul>
            <h2 className="mb-5 mt-5 text-3xl">Greetings</h2>
            <ul className="list">
              <li className="item">
                <span
                  className="text-muted-foreground"
                  {...handleFreshAttrs}
                >
                  Fresh
                </span>
                <div>
                  I'd like to also thank Fresh for backing me with his
                  point of view through Aerial's development. He's been a
                  day1 supporter and helped me test features anytime I
                  needed. #Fresh4President
                </div>
              </li>
              <li className="item">
                <span
                  className="text-muted-foreground"
                  onClick={handleEricDejaDeJoder}
                >
                  eric_guest1
                </span>
                <div>
                  Eric helped me test some of the first versions of Aerial,
                  aswell as being many hours in voice chat sharing his
                  opinions and ideas about the project.
                </div>
              </li>
            </ul>
            <h2 className="mb-5 mt-5 text-3xl">Translations</h2>
            <ul className="list">
              <li className="item">
                <div>
                  Thank you for dedicating part of your time to translate
                  Aerial to different languages 💖
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-muted-foreground">SayaGoodBye</span>•
                <div>Chinese (Simplified)</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
