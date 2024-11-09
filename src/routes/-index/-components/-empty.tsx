import { SearchX } from 'lucide-react'

export function EmptyResults({ title }: { title: string }) {
  return (
    <div className="mt-10 text-center text-muted-foreground">
      <SearchX
        size={48}
        className="mx-auto"
      />
      {title && <div className="mt-2 text-xl">{title}</div>}
    </div>
  )
}
