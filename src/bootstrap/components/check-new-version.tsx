import { BellRing } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../components/ui/alert'
import { Button } from '../../components/ui/button'

import { useCheckNewVersion } from './hooks'

import { whatIsThis } from '../../lib/callbacks'

export function CheckNewVersion() {
  const { t } = useTranslation(['general'])

  const { data, handleGoToNewRelease } = useCheckNewVersion()

  if (!data) {
    return null
  }

  return (
    <div className="-mt-4 -mx-4 p-4 lg:-mt-6 lg:-mx-6 lg:p-6">
      <Alert className="border-2 outline outline-offset-2 outline-[0.375rem] outline-muted-foreground/20 rounded">
        <BellRing className="h-4 w-4" />
        <AlertTitle>
          {t('version.title', {
            version: data.version,
          })}
        </AlertTitle>
        <AlertDescription>
          {t('version.description')}{' '}
          <Button
            className="px-0 underline whitespace-normal"
            size="sm"
            variant="link"
            onClick={handleGoToNewRelease}
            onAuxClick={whatIsThis()}
            asChild
          >
            <a href={data.link}>{data.link}</a>
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
