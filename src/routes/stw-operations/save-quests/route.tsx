import { createRoute, redirect } from '@tanstack/react-router'

import { Route as RootRoute } from '../../__root'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/save-quests',
  beforeLoad: () => {
    throw redirect({ to: '/stw-operations/daily-quests' })
  },
  component: () => null,
})
