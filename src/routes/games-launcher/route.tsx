import type { EpicGameEntry } from '../../types/games-launcher'

import { createRoute } from '@tanstack/react-router'
import { Gamepad2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useState } from 'react'

import { Route as RootRoute } from '../__root'

import { HomeBreadcrumb } from '../../components/navigations/breadcrumb/home'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '../../components/ui/card'
import { GoToTop } from '../../components/go-to-top'

import { useGetSelectedAccount } from '../../hooks/accounts'

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
  const [games, setGames] = useState<EpicGameEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [launchingId, setLaunchingId] = useState<string | null>(null)

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
        <CardContent className="p-0">
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
                        <Gamepad2 className="size-5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="truncate font-medium">{game.displayName}</span>
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