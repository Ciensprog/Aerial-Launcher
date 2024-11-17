import type { PropsWithChildren } from 'react'

import { defaultEmptyMessage, getRandomEmptyMessage } from './-constants'

import { cn } from '../../../lib/utils'

export function EmptyResults({
  children,
  className,
  total,
}: PropsWithChildren<{
  className?: string
  total: number
}>) {
  if (total > 0) {
    return children
  }

  return (
    <div
      className={cn(
        'border-2 border-muted-foreground/5 flex gap-2 items-center justify-center px-5 py-4 rounded-lg text-center text-muted-foreground',
        className
      )}
    >
      No available missions
    </div>
  )
}

export function EmptySection({
  children,
  isVBucks,
  title,
  total,
}: PropsWithChildren<{
  isVBucks?: boolean
  title?: string
  total: number
}>) {
  if (total > 0) {
    return children
  }

  const defaultMessage = title ?? defaultEmptyMessage.text
  const message = getRandomEmptyMessage(isVBucks)

  return (
    <div className="border-2 border-muted-foreground/5 flex gap-2 items-center justify-center px-5 py-4 rounded-lg text-center text-muted-foreground">
      {isVBucks && message
        ? message.author
          ? `${message.text} 一 ${message.author}`
          : message.text
        : defaultMessage}
      {message && message.icon && (
        <img
          src={message.icon}
          className="size-6"
        />
      )}
    </div>
  )
}
