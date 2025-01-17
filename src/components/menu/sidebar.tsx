import type { MouseEventHandler, PropsWithChildren } from 'react'

import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Link } from '@tanstack/react-router'
import { Copyright } from 'lucide-react'
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
              <Title className="pb-0">STW Operations</Title>
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
                        <span className="flex relative">
                          Auto-kick
                          {status !== null && (
                            <span
                              className={cn(
                                'absolute left-[calc(100%+0.5rem)] border flex font-bold items-center leading-none px-2 rounded text-[0.65rem] uppercase',
                                status === AutomationStatusType.ISSUE
                                  ? 'border-yellow-600 text-yellow-600'
                                  : 'border-green-600 text-green-600'
                              )}
                            >
                              {status === AutomationStatusType.ISSUE
                                ? 'Issue'
                                : 'Active'}
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
                        Party
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
                        Save Quests
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
                        Homebase Name
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
                        XP Boosts
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
                        Auto-pin Urns
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}

          {getMenuOptionVisibility('accountManagement', true) && (
            <>
              <Title className="pb-0">Account Management</Title>
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
                        V-Bucks Information
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
                        Redeem Codes
                      </Link>
                    </li>
                  )}
                  {getMenuOptionVisibility('devicesAuth') && (
                    <li className="item">
                      <Link
                        to="/account-management/device-auth"
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
                        Devices Auth
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
                        Epic Games Settings
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
              <Title className="pb-0">Advanced Mode</Title>
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
                        Matchmaking Track
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
                        World Info
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
                My Accounts
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
                        Authorization Code
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
                        Exchange Code
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
                        Device Auth
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
                        Remove Account
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
                Discord Server
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
                View on GitHub
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
                <span className="-m-0.5">Credits & Greetings</span>
              </Link>
            </Button>
          </div>
        </nav>
        <div className="px-5 text-center text-xs text-muted-foreground/60 lg:pl-7">
          <p>
            Release v{packageJson.version} -{' '}
            <a
              href={repositoryReleasesURL}
              className="underline hover:text-muted-foreground"
              onClick={goToReleasesURL}
              onAuxClick={whatIsThis()}
            >
              All Releases
            </a>
          </p>
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
