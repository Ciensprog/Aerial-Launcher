import type { RefObject } from 'react'

import { useTranslation } from 'react-i18next'
import { useEffect, useRef } from 'react'

export function useInputPaddingButton(
  config?: Partial<{
    deps: Array<unknown>
    customInputRef: RefObject<HTMLInputElement>
    customButtonRef: RefObject<HTMLButtonElement>
  }>
): [RefObject<HTMLInputElement>, RefObject<HTMLButtonElement>] {
  const { i18n } = useTranslation()

  const $input = useRef<HTMLInputElement>(null)
  const $button = useRef<HTMLButtonElement>(null)
  const customInputRef =
    config?.customInputRef !== undefined ? config?.customInputRef : $input
  const customButtonRef =
    config?.customButtonRef !== undefined
      ? config?.customButtonRef
      : $button

  useEffect(
    () => {
      if (customInputRef.current && customButtonRef.current) {
        customInputRef.current.style.setProperty(
          '--pr-button-width',
          `calc(${customButtonRef.current.clientWidth}px + 0.5rem)`
        )
      }
    },
    config?.deps !== undefined
      ? [i18n.language, ...config.deps]
      : [i18n.language]
  )

  return [customInputRef, customButtonRef]
}
