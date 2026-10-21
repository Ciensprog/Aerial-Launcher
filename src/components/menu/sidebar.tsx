import type { MouseEventHandler } from 'react'

import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Link } from '@tanstack/react-router'
import { Copyright } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import packageJson from '../../../package.json'

import { images } from '../../images'

import {
  repositoryReleasesURL,
  repositoryURL,
  supportDiscordServerURL,
} from '../../config/about/links'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from '../ui/tooltip'

import { useGetAutomationDataStatus } from '../../hooks/stw-operations/automation'
import { useGetTaxiServiceDataStatus } from '../../hooks/stw-operations/taxi-service'
import { useCustomizableMenuSettingsVisibility } from '../../hooks/settings'

import { useAccountListStore } from '../../state/accounts/list'
import { useCustomizableMenuSettingsStore } from '../../state/settings/customizable-menu'

import { numberWithCommaSeparator } from '../../lib/parsers/numbers'
import { normalizeMenuCategories } from '../../lib/settings/menu-layout'
import { cn } from '../../lib/utils'
import { SidebarCategoryBlock } from './sidebar-features'
import { whatIsThis } from '../../lib/callbacks'

export function SidebarMenu({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void
}) {
  const { t } = useTranslation(['sidebar'])

  const accounts = useAccountListStore((state) => state.accounts)
  const { status } = useGetAutomationDataStatus()
  const { status: tsStatus } = useGetTaxiServiceDataStatus()
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()
  const menuData = useCustomizableMenuSettingsStore((state) => state.data)
  const categories = useMemo(
    () => normalizeMenuCategories(menuData.categories, menuData),
    [menuData],
  )

  const total = Object.keys(accounts).length
  const areThereAccounts = total > 0
  const totalInText = numberWithCommaSeparator(total)

  const goToPage = () => {
    onOpenChange?.(false)
  }
  const gotToPage: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(
      (event.currentTarget as unknown as HTMLAnchorElement).href,
    )
  }
  const goToDiscordServerURL: MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(supportDiscordServerURL)
  }
  const goToRepositoryURL: MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(repositoryURL)
  }
  const goToReleasesURL: MouseEventHandler<HTMLAnchorElement> = (
    event,
  ) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(repositoryReleasesURL)
  }

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-var(--header-height))]">
      <div className="flex-1 pb-6">
        <nav className="grid items-start p-2 text-sm font-medium select-none lg:p-4 lg:pb-2">
          {categories.map((category) => {
            const title = sidebarCategoryTitle(category.id, category.name, t)

            return (
              <div key={category.id}>
                {category.id === 'myAccounts' ? (
                  <Separator className="my-2" />
                ) : null}
                <SidebarCategoryBlock
                  category={category}
                  title={title}
                  ctx={{
                    t,
                    goToPage,
                    areThereAccounts,
                    autoKickStatus: status,
                    taxiStatus: tsStatus,
                    totalInText,
                    getMenuOptionVisibility,
                  }}
                />
                {category.id === 'myAccounts' ? (
                  <Separator className="my-2" />
                ) : null}
              </div>
            )
          })}

          <div>
            <Button
              className={cn(
                'flex items-center gap-3 justify-center px-3 py-2 rounded-lg transition-all w-full',
                'text-muted-foreground',
                'hover:bg-muted hover:text-primary',
              )}
              size="sm"
              variant="ghost"
              onClick={gotToPage}
              onAuxClick={whatIsThis()}
              asChild
            >
              <a href="https://ko-fi.com/ciensprog">
                <img
                  src={images['ko-fi']}
                  className="flex-shrink-0 h-5"
                  alt="icon"
                />
              </a>
            </Button>
            <Button
              className={cn(
                'flex items-center gap-3 justify-start px-3 py-2 rounded-lg transition-all w-full',
                'text-muted-foreground',
                'hover:bg-muted hover:text-primary',
              )}
              size="sm"
              variant="ghost"
              onClick={gotToPage}
              onAuxClick={whatIsThis()}
              asChild
            >
              <a href="https://stw.news/">
                <img
                  src={images['aerial-stwnews']}
                  className="flex-shrink-0 -ml-0.5 size-5"
                  alt="icon"
                />
                <span className="-ml-1">STW News</span>
              </a>
            </Button>
            <Button
              className={cn(
                'flex items-center gap-3 justify-start px-3 py-2 rounded-lg transition-all w-full',
                'text-muted-foreground',
                'hover:bg-muted hover:text-primary',
              )}
              size="sm"
              variant="ghost"
              onClick={gotToPage}
              onAuxClick={whatIsThis()}
              asChild
            >
              <a href="https://discord.gg/XbGSTuXZdy">
                <img
                  src={images['aerial-ml-corp']}
                  className="flex-shrink-0 -ml-0.5 size-5"
                  alt="icon"
                />
                <span className="-ml-1">ML Corp</span>
              </a>
            </Button>
            <Button
              className={cn(
                'flex items-center gap-3 justify-start px-3 py-2 rounded-lg transition-all w-full',
                'text-muted-foreground',
                'hover:bg-muted hover:text-primary',
              )}
              size="sm"
              variant="ghost"
              onClick={goToDiscordServerURL}
              onAuxClick={whatIsThis()}
              asChild
            >
              <a href={supportDiscordServerURL}>
                <svg
                  className="size-3.5 text-muted-foreground"
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
                {t('links.discord')}
              </a>
            </Button>
            <Button
              className={cn(
                'flex items-center gap-3 justify-start px-3 py-2 rounded-lg transition-all w-full',
                'text-muted-foreground',
                'hover:bg-muted hover:text-primary',
              )}
              size="sm"
              variant="ghost"
              onClick={goToRepositoryURL}
              onAuxClick={whatIsThis()}
              asChild
            >
              <a href={repositoryURL}>
                <GitHubLogoIcon />
                {t('links.github')}
              </a>
            </Button>
            <Button
              className={cn(
                'flex items-center gap-3 justify-start px-3 py-2 rounded-lg transition-all w-full',
                'text-muted-foreground',
                'hover:bg-muted hover:text-primary',
              )}
              size="sm"
              variant="ghost"
              onClick={goToPage}
              onAuxClick={whatIsThis()}
              asChild
            >
              <Link to="/information/credits">
                <Copyright className="size-4" />
                <span className="-m-0.5">{t('links.credits')}</span>
              </Link>
            </Button>
          </div>
        </nav>
        <div className="px-5 text-center text-xs text-muted-foreground/60 lg:pl-7">
          <p>
            {t('version.release', {
              version: packageJson.version,
            })}
          </p>
          <a
            href={repositoryReleasesURL}
            className="inline-block mt-0.5 underline hover:text-muted-foreground"
            onClick={goToReleasesURL}
            onAuxClick={whatIsThis()}
          >
            {t('version.all-releases')}
          </a>
        </div>
      </div>
    </ScrollArea>
  )
}

function sidebarCategoryTitle(
  id: string,
  name: string,
  t: ReturnType<typeof useTranslation>['t'],
) {
  const custom = name.trim()

  if (custom !== '') {
    return custom
  }

  switch (id) {
    case 'general':
      return 'General'
    case 'currentAlerts':
      return t('general:go-to-current-alerts')
    case 'gamesLauncher':
      return t('games-launcher.title')
    case 'stwOperations':
      return t('stw-operations.title')
    case 'accountManagement':
      return t('account-management.title')
    case 'advancedMode':
      return t('advanced-mode.title')
    case 'myAccounts':
      return t('accounts.title')
    default:
      return 'Category'
  }
}
