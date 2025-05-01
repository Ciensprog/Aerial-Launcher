import { Link } from '@tanstack/react-router'
import { History, Menu, Minus, Rocket, Settings, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
import { cn } from '../../lib/utils'

export function Header() {
  const { t } = useTranslation(['general'])

  const { customProcessIsRunning, isButtonDisabled, open, setOpen } =
    useAttributesStates()
  const {
    handleCloseWindow,
    handleKillProcess,
    handleLaunch,
    handleMinimizeWindow,
    handleOpenSTWNewsProfile,
  } = useHandlers()
  const { isMinWith } = useWindowEvents()

  return (
    <>
      <header className="bg-muted/40 flex h-[var(--header-height)] items-center border-b px-1.5 relative">
        <div className="app-draggable-region absolute h-full left-0 top-0 w-full -z-10" />

        <div className="flex gap-1.5 relative w-full z-10">
          <Sheet
            open={open}
            onOpenChange={setOpen}
          >
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="not-draggable-region shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              className="flex flex-col p-0"
              side="left"
              hideCloseButton
            >
              <div>
                <div className="app-draggable-region flex h-[var(--header-height)] items-center justify-center text-center-">
                  <SheetClose className="not-draggable-region">
                    <X />
                    <span className="sr-only">close navigation menu</span>
                  </SheetClose>
                </div>
                <SidebarMenu onOpenChange={setOpen} />
              </div>
            </SheetContent>
          </Sheet>

          <AccountList />

          <Button
            className={cn('leading-4 not-draggable-region px-2 py-1', {
              'w-[7.5rem]': !isMinWith,
            })}
            size={isMinWith ? 'icon' : 'default'}
            variant={customProcessIsRunning ? 'default' : 'outline'}
            disabled={isButtonDisabled}
            onClick={
              customProcessIsRunning ? handleKillProcess : handleLaunch
            }
          >
            {isMinWith ? (
              customProcessIsRunning ? (
                <X size={20} />
              ) : (
                <Rocket size={20} />
              )
            ) : (
              <span className="text-balance truncate">
                {customProcessIsRunning
                  ? t('close-game.button')
                  : t('launch-game.button')}
              </span>
            )}
          </Button>

          <Button
            className="not-draggable-region"
            size="icon"
            variant="ghost"
            onAuxClick={whatIsThis()}
            asChild
          >
            <Link to="/settings">
              <Settings />
              <span className="sr-only">go to settings</span>
            </Link>
          </Button>

          <HistorySheet />

          <Button
            className="not-draggable-region"
            size="icon"
            variant="ghost"
            disabled={isButtonDisabled}
            onClick={handleOpenSTWNewsProfile}
          >
            <img
              src="https://stwcdn.com/aerial-stwnews.webp"
              className="w-8"
            />
            <span className="sr-only">go to stw news profile</span>
          </Button>

          <div className="ml-auto">
            <Button
              className="not-draggable-region"
              size="icon"
              variant="ghost"
              onClick={handleMinimizeWindow}
            >
              <Minus />
              <span className="sr-only">minimize application</span>
            </Button>
            <Button
              className="not-draggable-region"
              size="icon"
              variant="ghost"
              onClick={handleCloseWindow}
            >
              <X />
              <span className="sr-only">close application</span>
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}

function HistorySheet() {
  const { changeVisibility, visibility } = useUISidebarHistory()

  return (
    <Sheet
      open={visibility}
      onOpenChange={changeVisibility}
    >
      <SheetTrigger asChild>
        <Button
          className="not-draggable-region"
          size="icon"
          variant="ghost"
        >
          <History />
          <span className="sr-only">toggle history sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className="flex flex-col p-0"
        hideCloseButton
      >
        <HistoryMenu />
      </SheetContent>
    </Sheet>
  )
}
