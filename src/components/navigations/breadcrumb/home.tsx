import { Link } from '@tanstack/react-router'

import {
  BreadcrumbItem,
  BreadcrumbLink,
} from '../../../components/ui/breadcrumb'

import { whatIsThis } from '../../../lib/callbacks'

export function HomeBreadcrumb() {
  return (
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link
          to="/"
          onAuxClick={whatIsThis()}
        >
          Go To Current Alerts
        </Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
  )
}
