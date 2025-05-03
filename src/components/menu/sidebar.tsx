import type { MouseEventHandler, PropsWithChildren } from 'react'

import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Link } from '@tanstack/react-router'
import { Copyright } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { forwardRef } from 'react'

import packageJson from '../../../package.json'

import {
  repositoryReleasesURL,
  repositoryURL,
  supportDiscordServerURL,
} from '../../config/about/links'
import { AutomationStatusType } from '../../config/constants/automation'

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
import { useCustomizableMenuSettingsVisibility } from '../../hooks/settings'

import { useAccountListStore } from '../../state/accounts/list'

import { numberWithCommaSeparator } from '../../lib/parsers/numbers'
import { cn } from '../../lib/utils'
import { whatIsThis } from '../../lib/callbacks'

const currentClassNameHover =
  'hover:opacity-75 dark:opacity-100 dark:hover:text-white'
const activeClassName = 'opacity-75 dark:text-white'

export function SidebarMenu({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void
}) {
  const { t } = useTranslation(['sidebar'])

  const accounts = useAccountListStore((state) => state.accounts)
  const { status } = useGetAutomationDataStatus()
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  const total = Object.keys(accounts).length
  const areThereAccounts = total > 0
  const totalInText = numberWithCommaSeparator(total)

  const goToPage = () => {
    onOpenChange?.(false)
  }
  const gotToPage: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(
      (event.currentTarget as unknown as HTMLAnchorElement).href
    )
  }
  const goToDiscordServerURL: MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(supportDiscordServerURL)
  }
  const goToRepositoryURL: MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(repositoryURL)
  }
  const goToReleasesURL: MouseEventHandler<HTMLAnchorElement> = (
    event
  ) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(repositoryReleasesURL)
  }

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-var(--header-height))]">
      <div className="flex-1 pb-6">
        <nav className="grid items-start p-2 text-sm font-medium select-none lg:p-4 lg:pb-2">
          {getMenuOptionVisibility('stwOperations', true) && (
            <>
              <Title className="pb-0">{t('stw-operations.title')}</Title>
              <div
                className={cn(
                  'pl-3 py-2 text-muted-foreground',
                  '[&_.item>a]:flex'
                )}
              >
                <ul className="list-disc ml-5">
                  {getMenuOptionVisibility('autoKick') && (
                    <li className="item">
                      <Link
                        to="/stw-operations/automation"
                        className={cn(currentClassNameHover)}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        <span className="flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                          {t('stw-operations.options.auto-kick')}
                          {status !== null && (
                            <span
                              className={cn(
                                'border flex font-bold items-center leading-none px-2 rounded text-[0.65rem] uppercase',
                                status === AutomationStatusType.ISSUE
                                  ? 'border-yellow-600 text-yellow-600'
                                  : 'border-green-600 text-green-600'
                              )}
                            >
                              {status === AutomationStatusType.ISSUE
                                ? t(
                                    'stw-operations.auto-kick-status.issue'
                                  )
                                : t(
                                    'stw-operations.auto-kick-status.active'
                                  )}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('party') && (
                    <li className="item">
                      <Link
                        to="/stw-operations/party"
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t('stw-operations.options.party')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('saveQuests') && (
                    <li className="item">
                      <Link
                        to="/stw-operations/save-quests"
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t('stw-operations.options.save-quests')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('homebaseName') && (
                    <li className="item">
                      <Link
                        to="/stw-operations/homebase-name"
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t('stw-operations.options.homebase-name')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('xpBoosts') && (
                    <li className="item">
                      <Link
                        to="/stw-operations/xpboosts"
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t('stw-operations.options.xp-boosts')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('autoPinUrns') && (
                    <li className="item">
                      <Link
                        to="/stw-operations/urns"
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t('stw-operations.options.auto-pin-urns')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('autoLlamas') && (
                    <li className="item">
                      <Link
                        to="/stw-operations/auto-llamas"
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t('stw-operations.options.auto-llamas')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('unlock') && (
                    <li className="item">
                      <Link
                        to="/stw-operations/unlock"
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t('stw-operations.options.unlock')}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}

          {getMenuOptionVisibility('accountManagement', true) && (
            <>
              <Title className="pb-0">
                {t('account-management.title')}
              </Title>
              <div
                className={cn(
                  'pl-3 py-2 text-muted-foreground',
                  '[&_.item>a]:flex'
                )}
              >
                <ul className="list-disc ml-5">
                  {getMenuOptionVisibility('vbucksInformation') && (
                    <li className="item">
                      <Link
                        to="/account-management/vbucks-information"
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t(
                          'account-management.options.vbucks-information'
                        )}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('friendsManagement') && (
                    <li className="item">
                      <Link
                        to="/account-management/friends-management"
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t(
                          'account-management.options.friends-management'
                        )}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('redeemCodes') && (
                    <li className="item">
                      <Link
                        to="/account-management/redeem-codes"
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t('account-management.options.redeem-codes')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('devicesAuth') && (
                    <li className="item">
                      <Link
                        to="/account-management/devices-auth"
                        className={cn({
                          [currentClassNameHover]: areThereAccounts,
                          'cursor-not-allowed opacity-60':
                            !areThereAccounts,
                        })}
                        activeProps={{
                          className: cn({
                            [activeClassName]: areThereAccounts,
                          }),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                        disabled={!areThereAccounts}
                      >
                        {t('account-management.options.devices-auth')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('epicGamesSettings') && (
                    <li className="item">
                      <Link
                        to="/account-management/epic-games-settings"
                        className={cn({
                          [currentClassNameHover]: areThereAccounts,
                          'cursor-not-allowed opacity-60':
                            !areThereAccounts,
                        })}
                        activeProps={{
                          className: cn({
                            [activeClassName]: areThereAccounts,
                          }),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                        disabled={!areThereAccounts}
                      >
                        {t('account-management.options.epic-settings')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('eula') && (
                    <li className="item">
                      <Link
                        to="/account-management/eula"
                        className={cn({
                          [currentClassNameHover]: areThereAccounts,
                          'cursor-not-allowed opacity-60':
                            !areThereAccounts,
                        })}
                        activeProps={{
                          className: cn({
                            [activeClassName]: areThereAccounts,
                          }),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                        disabled={!areThereAccounts}
                      >
                        EULA
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}

          {getMenuOptionVisibility('advancedMode', true) && (
            <>
              <Title className="pb-0">{t('advanced-mode.title')}</Title>
              <div
                className={cn(
                  'pl-3 py-2 text-muted-foreground',
                  '[&_.item>a]:flex'
                )}
              >
                <ul className="list-disc ml-5">
                  {getMenuOptionVisibility('matchmakingTrack') && (
                    <li className="item">
                      <Link
                        to="/advanced-mode/matchmaking-track"
                        className={cn({
                          [currentClassNameHover]: areThereAccounts,
                          'cursor-not-allowed opacity-60':
                            !areThereAccounts,
                        })}
                        activeProps={{
                          className: cn({
                            [activeClassName]: areThereAccounts,
                          }),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                        disabled={!areThereAccounts}
                      >
                        {t('advanced-mode.options.matchmaking-track')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('worldInfo') && (
                    <li className="item">
                      <Link
                        to="/advanced-mode/world-info"
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t('advanced-mode.options.world-info')}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}

          {(getMenuOptionVisibility('stwOperations', true) ||
            getMenuOptionVisibility('accountManagement', true) ||
            getMenuOptionVisibility('advancedMode', true)) && (
            <Separator className="my-2" />
          )}

          {getMenuOptionVisibility('myAccounts', true) && (
            <>
              <Title className="pb-0">
                {t('accounts.title')}
                {getMenuOptionVisibility('showTotalAccounts') &&
                totalInText !== '0'
                  ? ` (${totalInText})`
                  : ''}
              </Title>
              <div
                className={cn(
                  'pl-3 py-2 text-muted-foreground',
                  '[&_.item>a]:flex'
                )}
              >
                <ul className="list-disc ml-5">
                  {getMenuOptionVisibility('authorizationCode') && (
                    <li className="item">
                      <Link
                        to="/accounts/add/$type"
                        params={{ type: 'authorization-code' }}
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t('accounts.options.auth')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('exchangeCode') && (
                    <li className="item">
                      <Link
                        to="/accounts/add/$type"
                        params={{ type: 'exchange-code' }}
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t('accounts.options.exchange')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('deviceAuth') && (
                    <li className="item">
                      <Link
                        to="/accounts/add/$type"
                        params={{ type: 'device-auth' }}
                        className={currentClassNameHover}
                        activeProps={{
                          className: cn(activeClassName),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                      >
                        {t('accounts.options.device')}
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('removeAccount') && (
                    <li className="item">
                      <Link
                        to="/accounts/remove"
                        className={cn({
                          [currentClassNameHover]: areThereAccounts,
                          'cursor-not-allowed opacity-60':
                            !areThereAccounts,
                        })}
                        activeProps={{
                          className: cn({
                            [activeClassName]: areThereAccounts,
                          }),
                        }}
                        onClick={goToPage}
                        onAuxClick={whatIsThis()}
                        disabled={!areThereAccounts}
                      >
                        {t('accounts.options.remove')}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}

          {getMenuOptionVisibility('myAccounts', true) && (
            <Separator className="my-2" />
          )}

          <div>
            <Button
              className={cn(
                'flex items-center gap-3 justify-center px-3 py-2 rounded-lg transition-all w-full',
                'text-muted-foreground',
                'hover:bg-muted hover:text-primary'
              )}
              size="sm"
              variant="ghost"
              onClick={gotToPage}
              onAuxClick={whatIsThis()}
              asChild
            >
              <a href="https://ko-fi.com/ciensprog">
                <img
                  src="https://stwcdn.com/ko-fi.webp"
                  className="flex-shrink-0 h-5"
                  alt="icon"
                />
              </a>
            </Button>
            <Button
              className={cn(
                'flex items-center gap-3 justify-start px-3 py-2 rounded-lg transition-all w-full',
                'text-muted-foreground',
                'hover:bg-muted hover:text-primary'
              )}
              size="sm"
              variant="ghost"
              onClick={gotToPage}
              onAuxClick={whatIsThis()}
              asChild
            >
              <a href="https://stw.news/">
                <img
                  src="https://stwcdn.com/aerial-stwnews.webp"
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
                'hover:bg-muted hover:text-primary'
              )}
              size="sm"
              variant="ghost"
              onClick={gotToPage}
              onAuxClick={whatIsThis()}
              asChild
            >
              <a href="https://discord.gg/XbGSTuXZdy">
                <img
                  src="https://stwcdn.com/aerial-ml-corp.webp"
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
                'hover:bg-muted hover:text-primary'
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
                'hover:bg-muted hover:text-primary'
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
                'hover:bg-muted hover:text-primary'
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

const Title = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ className?: string }>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-wrap items-center px-3 py-2 rounded-lg',
        'text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

// function OptionWithComingSoonTooltip({ text }: { text: string }) {
//   return (
//     <TooltipProvider>
//       <Tooltip
//         delayDuration={200}
//         disableHoverableContent
//       >
//         <TooltipTrigger asChild>
//           <Title>{text}</Title>
//         </TooltipTrigger>
//         <TooltipContent>
//           <p>Coming Soon!</p>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   )
// }
