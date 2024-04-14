import { Menu, X } from 'lucide-react'

import { Button } from '../../components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '../../components/ui/sheet'

import { AccountList } from '../../components/account-list'
import { SidebarMenu } from '../../components/menu/sidebar'

import { useAttributesStates } from './hooks'

export function Header() {
  const { isButtonDisabled, open, setOpen } = useAttributesStates()

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
        size="lg"
        variant="outline"
        disabled={isButtonDisabled}
      >
        Launch Game
      </Button>
    </header>
  )
}
