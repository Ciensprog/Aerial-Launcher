import { GitHubLogoIcon } from '@radix-ui/react-icons'

import { repositoryURL } from '../../config/about/links'

import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

import { cn } from '../../lib/utils'

export function SidebarMenu() {
  return (
    <ScrollArea className="h-full max-h-[calc(100vh - 3.5rem)]">
      <div className="flex-1 mt-4-">
        <nav className="grid items-start p-2 text-sm font-medium select-none lg:p-4">
          <OptionWithComingSoonTooltip text="STW Operations" />
          <OptionWithComingSoonTooltip text="Account Management" />
          <Separator className="my-2" />
          <div className="flex- gap-2-">
            <Button
              className={cn(
                'flex items-center gap-3 justify-start px-3 py-2 rounded-lg transition-all w-full',
                'text-muted-foreground',
                'hover:bg-muted hover:text-primary'
              )}
              size="sm"
              variant="ghost"
              onClick={(event) => {
                event.preventDefault()
                window.electronAPI.openExternalURL(repositoryURL)
              }}
              asChild
            >
              <a href={repositoryURL}>
                <GitHubLogoIcon />
                View on GitHub
              </a>
            </Button>
          </div>
        </nav>
      </div>
    </ScrollArea>
  )
}

function OptionWithComingSoonTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip
        delayDuration={200}
        disableHoverableContent
      >
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex flex-wrap items-center px-3 py-2 rounded-lg transition-all-',
              'text-muted-foreground'
            )}
          >
            {text}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Coming Soon!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
