import { UpdateIcon } from '@radix-ui/react-icons'

import { Button } from '../../../components/ui/button'

import {
  useWorldInfo,
  useWorldInfoActions,
} from '../../../hooks/advanced-mode/world-info'

import { cn } from '../../../lib/utils'

export function FetchAlertsButton() {
  const { isFetching, isReloading } = useWorldInfo()
  const { updateWorldInfoLoading } = useWorldInfoActions()

  const fetchAlerts = () => {
    updateWorldInfoLoading('isReloading', true)
    window.electronAPI.requestHomeWorldInfo()
  }

  return (
    <Button
      className="ml-auto"
      variant="secondary"
      onClick={fetchAlerts}
      disabled={isFetching || isReloading}
    >
      <span
        className={cn({
          'animate-spin': isReloading,
        })}
      >
        <UpdateIcon className="size-4" />
      </span>
    </Button>
  )
}
