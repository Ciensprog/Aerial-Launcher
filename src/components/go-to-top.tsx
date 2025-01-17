import { useTranslation } from 'react-i18next'
import { memo, useEffect, useState } from 'react'

import { Button } from './ui/button'

import { cn } from '../lib/utils'

type GoToTopProps = {
  containerId: string
}

export const GoToTop = memo(({ containerId }: GoToTopProps) => {
  const { t } = useTranslation(['general'])

  const { scrollToTopButtonIsVisible, scrollButtonOnClick } =
    useScrollToTop({
      containerId,
    })

  return (
    <Button
      className={cn(
        'bottom-5 fixed opacity-0 px-4 right-5 transition-all translate-x-28 z-10',
        {
          'opacity-100 translate-x-0': scrollToTopButtonIsVisible,
        }
      )}
      size="sm"
      variant="secondary"
      onClick={scrollButtonOnClick}
    >
      {t('go-to-top')}
    </Button>
  )
})

function useScrollToTop(config: Pick<GoToTopProps, 'containerId'>) {
  const [scrollToTopButtonIsVisible, setScrollToTopButtonIsVisible] =
    useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrollToTopButtonIsVisible(!entry.isIntersecting)
      },
      {
        threshold: [0],
      }
    )

    const $container = document.getElementById(config.containerId)

    if ($container) {
      observer.observe($container)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const scrollButtonOnClick = () => {
    document.querySelector('.main-wrapper-content')?.scroll({
      behavior: 'smooth',
      top: 0,
    })
  }

  return {
    scrollToTopButtonIsVisible,
    scrollButtonOnClick,
  }
}
