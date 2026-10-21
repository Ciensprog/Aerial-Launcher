import { useEffect, useState } from 'react'

export function RewardIcon({
  src,
  fallback,
  className,
  alt,
  title,
}: {
  src?: string
  fallback?: string
  className?: string
  alt?: string
  title?: string
}) {
  const [current, setCurrent] = useState(src)

  useEffect(() => {
    setCurrent(src)
  }, [src])

  if (!current) {
    return null
  }

  return (
    <img
      src={current}
      alt={alt ?? ''}
      title={title}
      className={className}
      onError={() => {
        if (fallback && current !== fallback) {
          setCurrent(fallback)
        }
      }}
    />
  )
}
