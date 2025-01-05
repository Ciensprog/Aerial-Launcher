import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation(['alerts'])

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
      {t('results.empty.missions')}
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
  const { t } = useTranslation(['alerts'], {
    keyPrefix: 'results.empty',
  })

  if (total > 0) {
    return children
  }

  const message = getRandomEmptyMessage(isVBucks)

  return (
    <div className="border-2 border-muted-foreground/5 flex gap-2 items-center justify-center px-5 py-4 rounded-lg text-center text-muted-foreground">
      {isVBucks && message
        ? message.author
          ? `${t(message.text)} 一 ${message.author}`
          : t(message.text)
        : title ?? t(defaultEmptyMessage.text)}
      {message && message.icon && (
        <img
          src={message.icon}
          className="size-6"
        />
      )}
    </div>
  )
}
