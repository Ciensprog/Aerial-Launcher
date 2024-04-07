import type { PropsWithChildren } from 'react'

import { Link } from '@tanstack/react-router'

import { Header } from '../layouts/header'

import { SidebarMenu } from '../components/menu/sidebar'

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[var(--sidebar-width-md)_1fr] lg:grid-cols-[var(--sidebar-width-lg)_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="app-draggable-region flex h-[var(--header-height)] items-center justify-center border-b px-4 shrink-0 lg:px-6">
            <div className="flex gap-2 items-center font-semibold">
              <Link to="/">Aerial Launcher</Link>
            </div>
          </div>
          <SidebarMenu />
        </div>
      </div>
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-col gap-4 h-[calc(100vh-var(--header-height))] overflow-y-auto p-4 relative lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
