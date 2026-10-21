import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'

import { useSettingsStore } from '../../state/settings/main'

import { useSetupForm } from '../../routes/settings/-hooks'

export function HiddenSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation(['settings'])
  const { persistSettings, debouncedPersistSettings } = useSetupForm()
  const customProxyEnabled = useSettingsStore(
    (state) => state.customProxyEnabled,
  )
  const customProxyPort = useSettingsStore((state) => state.customProxyPort)
  const [port, setPort] = useState(customProxyPort)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setPort(useSettingsStore.getState().customProxyPort)
        } else {
          debouncedPersistSettings.flush()
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('hidden.title')}</DialogTitle>
          <DialogDescription>{t('hidden.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor="hidden-proxy-port">{t('hidden.port')}</Label>
            <Input
              id="hidden-proxy-port"
              inputMode="numeric"
              placeholder="8080"
              value={port}
              onChange={(event) => {
                const value = event.target.value.replace(/[^0-9]/g, '')
                setPort(value)
                debouncedPersistSettings({ customProxyPort: value || '8080' })
              }}
              onBlur={() => {
                const next = port || '8080'
                setPort(next)
                debouncedPersistSettings.cancel()
                persistSettings({ customProxyPort: next })
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-1.5 pt-5">
            <Switch
              id="hidden-proxy-enabled"
              checked={customProxyEnabled}
              onCheckedChange={(checked) => {
                persistSettings({ customProxyEnabled: checked })
              }}
            />
            <Label
              htmlFor="hidden-proxy-enabled"
              className="text-center text-xs font-normal leading-tight"
            >
              {t('hidden.enable')}
            </Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
