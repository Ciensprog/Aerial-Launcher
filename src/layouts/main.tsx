import { Header } from '../layouts/header'

import { SidebarMenu } from '../components/menu/sidebar'

export function MainLayout() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="app-draggable-region flex h-14 items-center justify-center border-b px-4 shrink-0 lg:px-6">
            <div className="flex gap-2 items-center font-semibold">
              <span>Aerial Launcher</span>
            </div>
          </div>
          <SidebarMenu />
        </div>
      </div>
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Content</h1>
          </div>
        </main>
      </div>
    </div>
  )
}
