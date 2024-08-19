import type { PropsWithChildren } from 'react'

import { Link } from '@tanstack/react-router'

import { Header } from './header'

import { SidebarMenu } from '../components/menu/sidebar'
import { ScrollArea } from '../components/ui/scroll-area'

import logoLaucher from '../_assets/aerial-launcher.png'

import { whatIsThis } from '../lib/callbacks'
import { cn } from '../lib/utils'

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[var(--sidebar-width-md)_1fr] lg:grid-cols-[var(--sidebar-width-lg)_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="app-draggable-region flex h-[var(--header-height)] items-center justify-center border-b px-4 shrink-0 lg:px-6">
            <div className="flex gap-2 items-center font-semibold">
              <Link
                to="/"
                onAuxClick={whatIsThis()}
              >
                <img
                  src={logoLaucher}
                  className="w-20"
                  alt="Logo"
                />
              </Link>
            </div>
          </div>
          <SidebarMenu />
        </div>
      </div>
      <div className="flex flex-col">
        <Header />
        <main className="">
          <ScrollArea
            viewportClassName={cn(
              'main-wrapper-content [&>div]:!flex [&>div]:flex-col [&>div]:gap-4 [&>div]:h-[calc(100vh-var(--header-height))] [&>div]:p-4 [&>div]:relative [&>div]:lg:gap-6 [&>div]:lg:p-6'
            )}
          >
            {children}
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}
