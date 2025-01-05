import { useTranslation } from 'react-i18next'

import { Button } from '../../../components/ui/button'

import { useWorldInfo } from '../../../hooks/advanced-mode/world-info'
import { useZoneMissionsPagination } from './-hooks'

export function ZonePagination({
  pagination,
  perPage,
  totalMissions,
  totalPages,
}: {
  totalMissions: number
} & ReturnType<typeof useZoneMissionsPagination>) {
  const { t } = useTranslation(['alerts'], {
    keyPrefix: 'pagination',
  })

  const { isReloading } = useWorldInfo()

  return (
    <div className="flex gap-4 items-center justify-center mt-5">
      <Button
        size="sm"
        variant="secondary"
        onClick={pagination.previous}
        disabled={pagination.active <= 1 || isReloading}
      >
        {t('actions.previous')}
      </Button>
      <div className="text-center text-muted-foreground text-sm">
        <div>{t('results')}</div>
        <div>
          {pagination.active === totalPages
            ? totalMissions
            : pagination.active * perPage}
          /{totalMissions}
        </div>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={pagination.next}
        disabled={pagination.active === totalPages || isReloading}
      >
        {t('actions.next')}
      </Button>
    </div>
  )
}
