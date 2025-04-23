import { UpdateIcon } from '@radix-ui/react-icons'
import { domToBlob } from 'modern-screenshot'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../../components/ui/button'

import { BasicInformation } from './-basic-information'
import { usePlayerData } from './-hooks'
import { RewardsSummary } from './-rewards-summary'
import { SearchForm } from './-search-form'

import { toast } from '../../../lib/notifications'

export function AlertsDone() {
  return (
    <>
      <SearchForm />
      <ScreenshotGeneration />
      <div
        className="pb-14 px-2"
        id="alerts-done-container"
      >
        <BasicInformation />
        <RewardsSummary />
      </div>
    </>
  )
}

function ScreenshotGeneration() {
  const { t } = useTranslation(['general'])

  const [isLoading, setIsLoading] = useState(false)
  const { missions } = usePlayerData()

  if (missions.size <= 0) {
    return null
  }

  const handleGeneration = async () => {
    if (isLoading) {
      return
    }

    const $element = document.getElementById('alerts-done-container')

    if (!$element) {
      return
    }

    setIsLoading(true)

    try {
      const data = await domToBlob($element, {
        backgroundColor: 'hsl(240 3% 6%)',
        type: 'image/png',
      })

      await window.navigator.clipboard.write([
        new ClipboardItem({
          'image/png': data,
        }),
      ])

      toast(t('validations.screenshot.success'))

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast(t('validations.screenshot.error'))
    }

    setIsLoading(false)
  }

  return (
    <div className="flex justify-end">
      <Button
        className="relative h-8 mt-5 text-sm w-36"
        onClick={handleGeneration}
        disabled={isLoading}
      >
        {isLoading ? (
          <UpdateIcon className="animate-spin h-4" />
        ) : (
          t('generate-screenshot')
        )}
      </Button>
    </div>
  )
}
