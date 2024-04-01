import { Menu, X } from 'lucide-react'

import { Button } from '../components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '../components/ui/sheet'

import { AccountList } from '../components/account-list'
import { SidebarMenu } from '../components/menu/sidebar'

export function Header() {
  return (
    <header className="app-draggable-region flex h-14 items-center gap-1.5 border-b bg-muted/40 px-1.5">
      <Sheet>
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
            <SidebarMenu />
          </div>
        </SheetContent>
      </Sheet>
      <AccountList />
      <Button
        size="lg"
        variant="outline"
        disabled
      >
        Launch Game
      </Button>
    </header>
  )
}
