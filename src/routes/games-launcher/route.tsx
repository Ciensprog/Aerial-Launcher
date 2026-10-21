import type { EpicGameEntry } from '../../types/games-launcher'

import { createRoute } from '@tanstack/react-router'
import { useDebouncedPersist } from '../../hooks/use-debounced-persist'
import { Box, Gamepad2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { Route as RootRoute } from '../__root'

import { HomeBreadcrumb } from '../../components/navigations/breadcrumb/home'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { GoToTop } from '../../components/go-to-top'

import { useGetSelectedAccount } from '../../hooks/accounts'
import { useSettingsStore } from '../../state/settings/main'

import { buildSettingsSnapshot } from '../../lib/settings/snapshot'
import { cn, parseCustomDisplayName } from '../../lib/utils'
import { toast } from '../../lib/notifications'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/games-launcher',
  component: GamesLauncherPage,
})

function GamesLauncherPage() {
  const { t } = useTranslation(['games-launcher', 'general'])
  const { selected } = useGetSelectedAccount()
  const storedEpicGamesDir = useSettingsStore(
    useShallow((state) => state.epicGamesDir),
  )
  const storedExtraDirs = useSettingsStore(
    (state) => state.epicGamesExtraDirs,
  )
  const [epicGamesDir, setEpicGamesDir] = useState(storedEpicGamesDir)
  const [extraDirs, setExtraDirs] = useState<string[]>(
    storedExtraDirs ?? [],
  )
  const [games, setGames] = useState<EpicGameEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [launchingId, setLaunchingId] = useState<string | null>(null)

  useEffect(() => {
    setEpicGamesDir(storedEpicGamesDir)
  }, [storedEpicGamesDir])

  useEffect(() => {
    setExtraDirs(storedExtraDirs ?? [])
  }, [storedExtraDirs])

  const persistFolders = useCallback(
    async (dir: string, extras: string[]) => {
      const cleaned = extras.map((item) => item.trim()).filter(Boolean)
      const state = useSettingsStore.getState()
      const updated = buildSettingsSnapshot(state, {
        epicGamesDir: dir,
        epicGamesExtraDirs: cleaned,
      })

      state.updateSettings({
        epicGamesDir: dir,
        epicGamesExtraDirs: cleaned,
      })
      window.electronAPI.updateSettings(updated)
    },
    [],
  )

  const persistMainDir = useCallback(
    async (dir: string) => {
      await persistFolders(dir, extraDirs)
    },
    [extraDirs, persistFolders],
  )

  const debouncedPersistEpicGamesDir = useDebouncedPersist(
    persistMainDir,
    400,
  )

  const loadGames = useCallback(async () => {
    setLoading(true)
    try {
      const result = await window.electronAPI.gamesLauncherScan()
      setGames(result)
    } catch {
      setGames([])
      toast(t('notifications.scan-error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadGames()
  }, [loadGames])

  useEffect(() => {
    const listener = window.electronAPI.onGamesLauncherNotification(async (data) => {
      setLaunchingId(null)
      if (data.status) {
        toast(
          t('notifications.launch-success', {
            game: data.game.displayName,
            account: parseCustomDisplayName(data.account),
          }),
        )
        return
      }
      toast(
        t('notifications.launch-error', {
          game: data.game.displayName,
        }),
      )
    })

    return () => listener.removeListener()
  }, [t])

  const handleLaunch = (game: EpicGameEntry) => {
    if (!selected) {
      toast(t('notifications.no-account'))
      return
    }
    setLaunchingId(game.id)
    window.electronAPI.gamesLauncherStart({ account: selected, game })
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <HomeBreadcrumb />
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('title')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="w-full">
        <CardHeader className="border-b">
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          <div className="space-y-2 border-b px-4 py-4 sm:px-6">
            <Label htmlFor="games-launcher-epic-dir">{t('epic-dir.label')}</Label>
            <div className="flex gap-2">
              <Input
                id="games-launcher-epic-dir"
                value={epicGamesDir}
                placeholder={t('epic-dir.placeholder')}
                onChange={(e) => {
                  const value = e.target.value
                  setEpicGamesDir(value)
                  debouncedPersistEpicGamesDir(value)
                }}
                onBlur={async () => {
                  debouncedPersistEpicGamesDir.flush()
                  await persistFolders(epicGamesDir, extraDirs)
                  loadGames()
                }}
              />
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                onClick={async () => {
                  const dir = await window.electronAPI.gamesLauncherPickDir()
                  if (!dir) return
                  setEpicGamesDir(dir)
                  debouncedPersistEpicGamesDir.cancel()
                  await persistFolders(dir, extraDirs)
                  loadGames()
                }}
              >
                {t('epic-dir.browse')}
              </Button>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Label>{t('epic-dir.extra-label')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('epic-dir.extra-note')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0"
                  onClick={async () => {
                    const dir = await window.electronAPI.gamesLauncherPickDir()
                    if (!dir) return
                    const next = [...extraDirs, dir]
                    setExtraDirs(next)
                    await persistFolders(epicGamesDir, next)
                    loadGames()
                  }}
                >
                  {t('epic-dir.add')}
                </Button>
              </div>
              {extraDirs.map((dir, index) => (
                <div
                  key={`${dir}-${index}`}
                  className="flex gap-2"
                >
                  <Input
                    value={dir}
                    onChange={(event) => {
                      const next = extraDirs.map((item, current) =>
                        current === index ? event.target.value : item,
                      )
                      setExtraDirs(next)
                    }}
                    onBlur={async () => {
                      await persistFolders(epicGamesDir, extraDirs)
                      loadGames()
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0"
                    onClick={async () => {
                      const picked =
                        await window.electronAPI.gamesLauncherPickDir()
                      if (!picked) return
                      const next = extraDirs.map((item, current) =>
                        current === index ? picked : item,
                      )
                      setExtraDirs(next)
                      await persistFolders(epicGamesDir, next)
                      loadGames()
                    }}
                  >
                    {t('epic-dir.browse')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0"
                    onClick={async () => {
                      const next = extraDirs.filter(
                        (_, current) => current !== index,
                      )
                      setExtraDirs(next)
                      await persistFolders(epicGamesDir, next)
                      loadGames()
                    }}
                  >
                    {t('epic-dir.remove')}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t('loading')}
            </div>
          ) : games.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t('empty')}
            </div>
          ) : (
            <ul className="divide-y">
              {games.map((game) => (
                <li
                  key={game.id}
                  className="flex items-center gap-4 px-4 py-3 sm:px-6"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {game.icon ? (
                      <img
                        src={game.icon}
                        alt=""
                        className="size-10 shrink-0 rounded-md object-contain"
                      />
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                        {game.editor ? (
                          <Box className="size-5 text-muted-foreground" />
                        ) : (
                          <Gamepad2 className="size-5 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-medium">{game.displayName}</span>
                      {game.editor && (
                        <Badge variant="secondary" className="shrink-0">
                          {t('editor-badge')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    className={cn(
                      'shrink-0 bg-amber-400 text-black hover:bg-amber-300',
                      !game.exchangeLaunch && 'opacity-60',
                    )}
                    disabled={!selected || !game.exchangeLaunch || launchingId === game.id}
                    onClick={() => handleLaunch(game)}
                  >
                    {launchingId === game.id ? t('launching') : t('launch')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <GoToTop />
    </>
  )
}