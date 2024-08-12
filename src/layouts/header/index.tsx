import { Link } from '@tanstack/react-router'
import { History, Menu, Minus, Rocket, Settings, X } from 'lucide-react'

import { repositoryAssetsURL } from '../../config/about/links'

import { Button } from '../../components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '../../components/ui/sheet'

import { AccountList } from '../../components/account-list'
import { HistoryMenu } from '../../components/menu/history'
import { SidebarMenu } from '../../components/menu/sidebar'

import { useUISidebarHistory } from '../../hooks/ui/sidebars'
import { useAttributesStates, useHandlers, useWindowEvents } from './hooks'

import { whatIsThis } from '../../lib/callbacks'

export function Header() {
  const { changeVisibility, visibility } = useUISidebarHistory()
  const { isButtonDisabled, open, setOpen } = useAttributesStates()
  const {
    handleCloseWindow,
    handleLaunch,
    handleMinimizeWindow,
    handleOpenFNDBProfile,
  } = useHandlers()
  const { isMinWith } = useWindowEvents()

  return (
    <header className="app-draggable-region bg-muted/40 flex h-[var(--header-height)] items-center gap-1.5 border-b px-1.5">
      <Sheet
        open={open}
        onOpenChange={setOpen}
      >
        <SheetTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          className="flex flex-col"
          side="left"
          hideCloseButton
        >
          <div>
            <div className="text-center">
              <SheetClose>
                <X />
                <span className="sr-only">Close navigation menu</span>
              </SheetClose>
            </div>
            <SidebarMenu onOpenChange={setOpen} />
          </div>
        </SheetContent>
      </Sheet>

      <AccountList />

      <Button
        size={isMinWith ? 'icon' : 'default'}
        variant="outline"
        disabled={isButtonDisabled}
        onClick={handleLaunch}
      >
        {isMinWith ? <Rocket size={20} /> : 'Launch Game'}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onAuxClick={whatIsThis()}
        asChild
      >
        <Link to="/settings">
          <Settings />
          <span className="sr-only">Go to settings</span>
        </Link>
      </Button>

      <Sheet
        open={visibility}
        onOpenChange={changeVisibility}
      >
        <SheetTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
          >
            <History />
            <span className="sr-only">Toggle history sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          className="flex flex-col"
          hideCloseButton
        >
          <div>
            <div className="text-center">
              <SheetClose>
                <X />
                <span className="sr-only">Close history sidebar</span>
              </SheetClose>
            </div>
            <HistoryMenu />
          </div>
        </SheetContent>
      </Sheet>

      <Button
        size="icon"
        variant="ghost"
        disabled={isButtonDisabled}
        onClick={handleOpenFNDBProfile}
      >
        <img
          src={`${repositoryAssetsURL}/images/eventcurrency_founders.png`}
          className="w-8"
        />
        <span className="sr-only">Go to FortniteDB profile</span>
      </Button>

      <div className="ml-auto">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleMinimizeWindow}
        >
          <Minus />
          <span className="sr-only">Minimize application</span>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCloseWindow}
        >
          <X />
          <span className="sr-only">Close application</span>
        </Button>
      </div>
    </header>
  )
}
