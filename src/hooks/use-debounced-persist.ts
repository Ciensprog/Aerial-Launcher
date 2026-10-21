import { useCallback, useEffect, useRef } from 'react'

type DebouncedPersist<T extends (...args: never[]) => void> = ((
  ...args: Parameters<T>
) => void) & {
  flush: () => void
  cancel: () => void
}

export function useDebouncedPersist<T extends (...args: never[]) => void>(
  callback: T,
  delay: number,
): DebouncedPersist<T> {
  const callbackRef = useRef(callback)
  const timerRef = useRef(0)
  const argsRef = useRef<Parameters<T>>()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const cancel = useCallback(() => {
    window.clearTimeout(timerRef.current)
    argsRef.current = undefined
  }, [])

  const flush = useCallback(() => {
    window.clearTimeout(timerRef.current)
    if (argsRef.current !== undefined) {
      callbackRef.current(...argsRef.current)
      argsRef.current = undefined
    }
  }, [])

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        if (argsRef.current !== undefined) {
          callbackRef.current(...argsRef.current)
          argsRef.current = undefined
        }
      }, delay)
    },
    [delay],
  ) as DebouncedPersist<T>

  debounced.flush = flush
  debounced.cancel = cancel

  return debounced
}