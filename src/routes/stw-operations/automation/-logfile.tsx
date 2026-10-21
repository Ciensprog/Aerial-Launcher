import { FolderOpen } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { GoToTop } from '../../../components/go-to-top'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Switch } from '../../../components/ui/switch'

import { toast } from '../../../lib/notifications'
import { useAutomationLogFileStore } from '../../../state/stw-operations/automation-logfile'

export function AutomationLogFileContent() {
  const { t } = useTranslation(['stw-operations'])
  const {
    logPath,
    kick,
    claim,
    claimParty,
    transferMats,
    fortniteRunning,
    instanceCount,
    players,
    lastEvent,
    stamp,
  } = useAutomationLogFileStore(
    useShallow((state) => ({
      logPath: state.logPath,
      kick: state.kick,
      claim: state.claim,
      claimParty: state.claimParty,
      transferMats: state.transferMats,
      fortniteRunning: state.fortniteRunning,
      instanceCount: state.instanceCount,
      players: state.players,
      lastEvent: state.lastEvent,
      stamp: state.stamp,
    })),
  )
  const lastStamp = useRef(0)
  const pathFocused = useRef(false)
  const [pathDraft, setPathDraft] = useState(logPath)

  useEffect(() => {
    if (!pathFocused.current) {
      setPathDraft(logPath)
    }
  }, [logPath])

  useEffect(() => {
    if (!stamp || stamp === lastStamp.current) {
      return
    }

    lastStamp.current = stamp

    if (lastEvent) {
      toast(lastEvent)
    }
  }, [lastEvent, stamp])

  const names = players
    .map((player) => player.displayName)
    .filter((name): name is string => Boolean(name))

  return (
    <>
      <div className="flex flex-grow">
        <div className="flex flex-col items-center justify-center w-full">
          <Card
            className="max-w-lg w-full"
            id="logfile-card"
          >
            <CardHeader className="border-b">
              <CardDescription>
                {t('auto-kick.logfile.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6">
              <div className="space-y-2">
                <div className="text-sm">{t('auto-kick.logfile.path')}</div>
                <div className="flex gap-2">
                  <Input
                    value={pathDraft}
                    onChange={(event) => {
                      setPathDraft(event.target.value)
                    }}
                    onFocus={() => {
                      pathFocused.current = true
                    }}
                    onBlur={() => {
                      pathFocused.current = false
                      window.electronAPI.updateAutomationLogFile({
                        logPath: pathDraft,
                      })
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      window.electronAPI.pickAutomationLogFile()
                    }}
                  >
                    <FolderOpen className="mr-2 size-4" />
                    {t('auto-kick.logfile.browse')}
                  </Button>
                </div>
              </div>

              <div className="text-muted-foreground text-sm">
                {fortniteRunning
                  ? t('auto-kick.logfile.running', {
                      count: instanceCount,
                    })
                  : t('auto-kick.logfile.not-running')}
                {' · '}
                {names.length > 0
                  ? t('auto-kick.logfile.player', {
                      name: names.join(', '),
                    })
                  : t('auto-kick.logfile.no-player')}
              </div>

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex flex-grow items-center justify-between">
                  <span>{t('auto-kick.options.kick')}</span>
                  <Switch
                    checked={kick}
                    onCheckedChange={(value) => {
                      window.electronAPI.updateAutomationLogFile({
                        kick: value,
                      })
                    }}
                  />
                </div>
                <div className="flex flex-grow items-center justify-between">
                  <span>{t('auto-kick.options.claim')}</span>
                  <Switch
                    checked={claim}
                    onCheckedChange={(value) => {
                      window.electronAPI.updateAutomationLogFile({
                        claim: value,
                      })
                    }}
                  />
                </div>
                <div className="flex flex-grow items-center justify-between">
                  <span>{t('auto-kick.options.claim-party')}</span>
                  <Switch
                    checked={claimParty}
                    disabled={!claim}
                    onCheckedChange={(value) => {
                      window.electronAPI.updateAutomationLogFile({
                        claimParty: value,
                      })
                    }}
                  />
                </div>
                <div className="flex flex-grow items-center justify-between">
                  <span>{t('auto-kick.options.transfer-mats')}</span>
                  <Switch
                    checked={transferMats}
                    onCheckedChange={(value) => {
                      window.electronAPI.updateAutomationLogFile({
                        transferMats: value,
                      })
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <GoToTop containerId="logfile-card" />
    </>
  )
}
