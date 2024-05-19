import { PropsWithChildren } from 'react'

import { Separator as BaseSeparator } from '../separator'

import { cn } from '../../../lib/utils'

export function SeparatorWithTitle({
  children,
  className,
  classNameContainer,
}: PropsWithChildren<{
  className?: string
  classNameContainer?: string
}>) {
  return (
    <BaseSeparator
      className={cn('flex justify-center relative', classNameContainer)}
    >
      <div
        className={cn(
          'absolute bg-background font-semibold px-1.5 text-muted-foreground text-sm -top-2.5',
          className
        )}
      >
        {children}
      </div>
    </BaseSeparator>
  )
}
