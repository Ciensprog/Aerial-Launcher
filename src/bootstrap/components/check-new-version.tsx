import { BellRing } from 'lucide-react'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../components/ui/alert'
import { Button } from '../../components/ui/button'

import { useCheckNewVersion } from './hooks'

export function CheckNewVersion() {
  const { data, handleGoToNewRelease } = useCheckNewVersion()

  if (!data) {
    return null
  }

  return (
    <Alert>
      <BellRing className="h-4 w-4" />
      <AlertTitle>New version {data.version}</AlertTitle>
      <AlertDescription>
        You can download new version (.exe file) from here:{' '}
        <Button
          className="px-0 underline whitespace-normal"
          size="sm"
          variant="link"
          asChild
        >
          <a
            href={data.link}
            onClick={handleGoToNewRelease}
          >
            {data.link}
          </a>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
