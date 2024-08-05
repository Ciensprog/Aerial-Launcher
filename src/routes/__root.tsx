import {
  createRootRoute,
  Outlet,
  useLocation,
} from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { MainLayout } from '../layouts/main'

export const Route = createRootRoute({
  component: () => {
    useScrollToTop()

    return (
      <>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </>
    )
  },
})

function useScrollToTop() {
  const $main = useRef<HTMLElement | null>(null)
  const pathname = useLocation({
    select: (location) => location.pathname,
  })

  useEffect(() => {
    if (!$main.current) {
      $main.current = document.querySelector('main')
    }

    $main.current?.scroll({
      behavior: 'instant',
      top: 0,
    })
  }, [pathname])
}
