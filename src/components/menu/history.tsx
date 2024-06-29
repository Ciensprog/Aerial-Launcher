import { ScrollArea } from '../ui/scroll-area'

export function HistoryMenu() {
  return (
    <ScrollArea className="h-full min-h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-center text-muted-foreground min-h-[calc(100vh-3.5rem)]">
        Claimed Reward History
      </div>
    </ScrollArea>
  )
}
