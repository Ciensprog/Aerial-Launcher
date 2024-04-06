import type { MouseEventHandler, PropsWithChildren } from 'react'

import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Link } from '@tanstack/react-router'
import { forwardRef } from 'react'

import packageJson from '../../../package.json'

import {
  repositoryReleasesURL,
  repositoryURL,
} from '../../config/about/links'

import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

import { useAccountListStore } from '../../state/accounts/list'

import { cn } from '../../lib/utils'

const currentClassNameHover =
  'hover:opacity-75 dark:opacity-100 dark:hover:text-white'
const activeClassName = 'opacity-75 dark:text-white'

export function SidebarMenu() {
  const accounts = useAccountListStore((state) => state.accounts)
  const total = Object.keys(accounts).length
  const areThereAccounts = total > 0
  const totalInText = new Intl.NumberFormat().format(total)

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
    <ScrollArea className="h-full max-h-[calc(100vh - 3.5rem)]">
      <div className="flex-1">
        <nav className="grid items-start p-2 text-sm font-medium select-none lg:p-4 lg:pb-2">
          <OptionWithComingSoonTooltip text="STW Operations" />
          <OptionWithComingSoonTooltip text="Account Management" />
          <Separator className="my-2" />
          <Title className="pb-0">My Accounts ({totalInText}):</Title>
          <div
            className={cn(
              'px-3 py-2 text-muted-foreground',
              '[&_.item-auth-type>a]:flex'
            )}
          >
            <ul className="list-disc ml-5">
              <li className="item-auth-type">
                <Link
                  to="/accounts/add/$type"
                  params={{ type: 'authorization-code' }}
                  className={currentClassNameHover}
                  activeProps={{
                    className: cn(activeClassName),
                  }}
                >
                  Authorization Code
                </Link>
              </li>
              <li className="item-auth-type">
                <Link
                  to="/accounts/add/$type"
                  params={{ type: 'exchange-code' }}
                  className={currentClassNameHover}
                  activeProps={{
                    className: cn(activeClassName),
                  }}
                >
                  Exchange Code
                </Link>
              </li>
              <li className="item-auth-type">
                <Link
                  to="/accounts/add/$type"
                  params={{ type: 'device-auth' }}
                  className={currentClassNameHover}
                  activeProps={{
                    className: cn(activeClassName),
                  }}
                >
                  Device Auth
                </Link>
              </li>
              <li className="item-auth-type">
                <Link
                  to="/accounts/remove"
                  className={cn({
                    [currentClassNameHover]: areThereAccounts,
                    'cursor-not-allowed opacity-60': !areThereAccounts,
                  })}
                  activeProps={{
                    className: cn({
                      [activeClassName]: areThereAccounts,
                    }),
                  }}
                  disabled={!areThereAccounts}
                >
                  Remove Account
                </Link>
              </li>
            </ul>
          </div>
          <Separator className="my-2" />
          <div className="">
            <Button
              className={cn(
                'flex items-center gap-3 justify-start px-3 py-2 rounded-lg transition-all w-full',
                'text-muted-foreground',
                'hover:bg-muted hover:text-primary'
              )}
              size="sm"
              variant="ghost"
              onClick={goToRepositoryURL}
              asChild
            >
              <a href={repositoryURL}>
                <GitHubLogoIcon />
                View on GitHub
              </a>
            </Button>
          </div>
        </nav>
        <div className="pl-5 text-xs text-muted-foreground/60 lg:pl-7">
          <p className="">
            Release v{packageJson.version} -{' '}
            <a
              href={repositoryReleasesURL}
              className="underline"
              onClick={goToReleasesURL}
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

function OptionWithComingSoonTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip
        delayDuration={200}
        disableHoverableContent
      >
        <TooltipTrigger asChild>
          <Title>{text}</Title>
        </TooltipTrigger>
        <TooltipContent>
          <p>Coming Soon!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
