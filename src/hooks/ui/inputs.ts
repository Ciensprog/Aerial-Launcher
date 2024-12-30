import type { RefObject } from 'react'

import { useTranslation } from 'react-i18next'
import { useEffect, useRef } from 'react'

export function useInputPaddingButton(
  config?: Partial<{
    deps: Array<unknown>
  }>
): [RefObject<HTMLInputElement>, RefObject<HTMLButtonElement>] {
  const { i18n } = useTranslation()

  const $input = useRef<HTMLInputElement>(null)
  const $button = useRef<HTMLButtonElement>(null)

  useEffect(
    () => {
      if ($button.current && $input.current) {
        $input.current.style.setProperty(
          '--pr-button-width',
          `calc(${$button.current.clientWidth}px + 0.5rem)`
        )
      }
    },
    config?.deps !== undefined
      ? [i18n.language, ...config.deps]
      : [i18n.language]
  )

  return [$input, $button]
}
