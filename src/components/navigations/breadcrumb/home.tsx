import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import {
  BreadcrumbItem,
  BreadcrumbLink,
} from '../../../components/ui/breadcrumb'

import { whatIsThis } from '../../../lib/callbacks'

export function HomeBreadcrumb() {
  const { t } = useTranslation(['general'])

  return (
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link
          to="/"
          onAuxClick={whatIsThis()}
        >
          {t('go-to-current-alerts')}
        </Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
  )
}
