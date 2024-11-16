import type { WorldInfoMission } from '../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { useEffect, useRef, useState } from 'react'

export function useAlertItemCounter({
  validationFn,
  data,
  key,
}: {
  data: Collection<string, WorldInfoMission>
  key?: string
  validationFn?: (key: string) => boolean
}) {
  return data.reduce((accumulator, mission) => {
    const alert = mission.ui.alert.rewards.find(
      (reward) =>
        validationFn?.(reward.itemId) ??
        (key !== undefined ? reward.itemId.includes(key) : false)
    )

    accumulator += alert?.quantity ?? 0

    return accumulator
  }, 0)
}

export function useIntersectingElement({ deps }: { deps?: unknown }) {
  const $element = useRef<HTMLHeadingElement>(null)

  useEffect(
    () => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          entry.target.classList.toggle(
            'is-sticky',
            entry.intersectionRatio < 1
          )
        },
        {
          threshold: [1],
        }
      )

      if ($element.current) {
        observer.observe($element.current)
      }

      return () => {
        observer.disconnect()
      }
    },
    deps !== undefined ? [deps] : []
  )

  return $element
}

export function useScrollToTop() {
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

    const $container = document.getElementById(
      'alert-navigation-container'
    )

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
