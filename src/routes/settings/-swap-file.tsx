import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

import { useDebouncedPersist } from '../../hooks/use-debounced-persist'

import { DEFAULT_SWAP_DISPLAY_NAME } from '../../lib/misje/presets'

export function SwapFileSettings() {
  const { t } = useTranslation(['settings'])
  const [displayNameValue, setDisplayNameValue] = useState(
    DEFAULT_SWAP_DISPLAY_NAME,
  )

  const persist = useCallback(async (value: string) => {
    await window.electronAPI.misjeSaveConfig({
      displayNameValue: value,
    })
  }, [])

  const debouncedPersist = useDebouncedPersist(persist, 400)

  useEffect(() => {
    window.electronAPI
      .misjeGetConfig()
      .then((config) => {
        setDisplayNameValue(
          config.displayNameValue || DEFAULT_SWAP_DISPLAY_NAME,
        )
      })
      .catch(() => {})
  }, [])

  return (
    <div className="grid gap-2">
      <Label htmlFor="swap-display-name">
        {t('swap-file.display-name.label')}
      </Label>
      <p className="text-muted-foreground text-xs">
        {t('swap-file.display-name.note')}
      </p>
      <Input
        id="swap-display-name"
        value={displayNameValue}
        onChange={(event) => {
          const value = event.target.value
          setDisplayNameValue(value)
          debouncedPersist(value)
        }}
        onBlur={() => {
          debouncedPersist.flush()
          persist(displayNameValue)
        }}
      />
    </div>
  )
}
