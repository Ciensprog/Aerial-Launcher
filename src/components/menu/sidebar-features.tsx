import type { MenuCategory, MenuFeatureKey } from '../../lib/settings/menu-layout'

import { Link } from '@tanstack/react-router'
import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  Cloud,
  Download,
  Bot,
  CarTaxiFront,
  Coins,
  FileText,
  Gamepad2,
  Globe,
  Key,
  Laptop,
  MonitorSmartphone,
  Package,
  PartyPopper,
  Pin,
  Radar,
  ScrollText,
  Settings,
  Shield,
  ShoppingBag,
  Swords,
  Ticket,
  UserMinus,
  UserRound,
  Zap,
} from 'lucide-react'
import { forwardRef, type PropsWithChildren, type ReactNode } from 'react'
import type { TFunction } from 'i18next'

import { AutomationStatusType } from '../../config/constants/automation'
import { cn } from '../../lib/utils'
import {
  isUntitledTopLevelCategory,
} from '../../lib/settings/menu-layout'
import { whatIsThis } from '../../lib/callbacks'

const currentClassNameHover =
  'hover:opacity-75 dark:opacity-100 dark:hover:text-white'
const activeClassName = 'opacity-75 dark:text-white'

export type SidebarFeatureContext = {
  t: TFunction
  goToPage: () => void
  areThereAccounts: boolean
  autoKickStatus: string | null
  taxiStatus: string | null
  totalInText: string
  getMenuOptionVisibility: (key: MenuFeatureKey) => boolean
}

export function SidebarCategoryBlock({
  category,
  title,
  ctx,
}: {
  category: MenuCategory
  title: string
  ctx: SidebarFeatureContext
}) {
  const linkItems = category.items.filter(
    (item) =>
      item !== 'showTotalAccounts' && ctx.getMenuOptionVisibility(item),
  )
  const showTotal =
    category.items.includes('showTotalAccounts') &&
    ctx.getMenuOptionVisibility('showTotalAccounts')

  if (!category.visible) {
    return null
  }

  if (linkItems.length <= 0 && !showTotal) {
    return null
  }

  if (isUntitledTopLevelCategory(category)) {
    return (
      <>
        {linkItems.map((item) => (
          <SidebarFeatureLink
            key={item}
            feature={item}
            variant="top"
            ctx={ctx}
          />
        ))}
      </>
    )
  }

  return (
    <>
      <Title className="pb-0">
        {title}
        {showTotal && ctx.totalInText !== '0' ? ` (${ctx.totalInText})` : ''}
      </Title>
      {linkItems.length > 0 ? (
        <div
          className={cn(
            'pl-3 py-2 text-muted-foreground',
            '[&_.item>a]:flex',
          )}
        >
          <ul className="list-disc ml-5">
            {linkItems.map((item) => (
              <SidebarFeatureLink
                key={item}
                feature={item}
                variant="list"
                ctx={ctx}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </>
  )
}

function SidebarFeatureLink({
  feature,
  variant,
  ctx,
}: {
  feature: MenuFeatureKey
  variant: 'top' | 'list'
  ctx: SidebarFeatureContext
}) {
  const content = featureContent(feature, ctx)

  if (!content) {
    return null
  }

  const link = (
    <Link
      {...content.link}
      className={cn(
        variant === 'top' && 'pl-3 py-2 text-muted-foreground',
        content.disabled
          ? 'cursor-not-allowed opacity-60'
          : currentClassNameHover,
      )}
      activeProps={{
        className: cn({
          [activeClassName]: !content.disabled,
        }),
      }}
      onClick={content.skipGoToPage ? undefined : ctx.goToPage}
      onAuxClick={whatIsThis()}
      disabled={content.disabled}
    >
      <span
        className={cn(
          'flex gap-2 items-center',
          content.wrap && 'flex-wrap gap-x-2 gap-y-0.5',
        )}
      >
        {content.icon}
        {content.label}
        {content.badge}
      </span>
    </Link>
  )

  if (variant === 'list') {
    return <li className="item">{link}</li>
  }

  return link
}

function featureContent(
  feature: MenuFeatureKey,
  ctx: SidebarFeatureContext,
): {
  link: { to: string; params?: { type: string } }
  icon: ReactNode
  label: string
  badge?: ReactNode
  wrap?: boolean
  disabled?: boolean
  skipGoToPage?: boolean
} | null {
  const { t, areThereAccounts, autoKickStatus, taxiStatus } = ctx
  const iconClass = 'size-3.5 shrink-0 opacity-80'

  switch (feature) {
    case 'showTotalAccounts':
      return null
    case 'currentAlerts':
      return {
        link: { to: '/' },
        icon: <Bell className={iconClass} />,
        label: t('general:go-to-current-alerts'),
        skipGoToPage: true,
      }
    case 'gamesLauncher':
      return {
        link: { to: '/games-launcher' },
        icon: <Gamepad2 className={iconClass} />,
        label: t('games-launcher.title'),
      }
    case 'autoKick':
      return {
        link: { to: '/stw-operations/automation' },
        icon: <Bot className={iconClass} />,
        label: t('stw-operations.options.auto-kick'),
        wrap: true,
        badge:
          autoKickStatus !== null ? (
            <StatusBadge
              status={autoKickStatus}
              t={t}
            />
          ) : undefined,
      }
    case 'taxiService':
      return {
        link: { to: '/stw-operations/taxi-service' },
        icon: <CarTaxiFront className={iconClass} />,
        label: t('stw-operations.options.taxi-service'),
        wrap: true,
        badge:
          taxiStatus !== null ? (
            <StatusBadge
              status={taxiStatus}
              t={t}
            />
          ) : undefined,
      }
    case 'party':
      return {
        link: { to: '/stw-operations/party' },
        icon: <PartyPopper className={iconClass} />,
        label: t('stw-operations.options.party'),
      }
    case 'dailyQuests':
      return {
        link: { to: '/stw-operations/daily-quests' },
        icon: <ScrollText className={iconClass} />,
        label: t('stw-operations.options.daily-quests'),
      }
    case 'dqWeapons':
      return {
        link: { to: '/stw-operations/dq-weapons' },
        icon: <Swords className={iconClass} />,
        label: t('stw-operations.options.dq-weapons'),
      }
    case 'stormShields':
      return {
        link: { to: '/stw-operations/storm-shields' },
        icon: <Shield className={iconClass} />,
        label: t('stw-operations.options.storm-shields'),
      }
    case 'xpBoosts':
      return {
        link: { to: '/stw-operations/xpboosts' },
        icon: <Zap className={iconClass} />,
        label: t('stw-operations.options.xp-boosts'),
      }
    case 'autoPinUrns':
      return {
        link: { to: '/stw-operations/urns' },
        icon: <Pin className={iconClass} />,
        label: t('stw-operations.options.auto-pin-urns'),
      }
    case 'itemShop':
      return {
        link: { to: '/stw-operations/item-shop' },
        icon: <ShoppingBag className={iconClass} />,
        label: t('stw-operations.options.item-shop'),
      }
    case 'llamaManager':
      return {
        link: { to: '/stw-operations/llama-manager' },
        icon: <Package className={iconClass} />,
        label: t('stw-operations.options.llama-manager'),
      }
    case 'collectionBook':
      return {
        link: { to: '/stw-operations/collection-book' },
        icon: <BookOpen className={iconClass} />,
        label: t('stw-operations.options.collection-book'),
      }
    case 'accountInfo':
      return {
        link: { to: '/stw-operations/account-info' },
        icon: <UserRound className={iconClass} />,
        label: t('stw-operations.options.account-info'),
      }
    case 'vbucksInformation':
      return {
        link: { to: '/account-management/vbucks-information' },
        icon: <Coins className={iconClass} />,
        label: t('account-management.options.vbucks-information'),
      }
    case 'cloudStorage':
      return {
        link: { to: '/stw-operations/cloud-storage' },
        icon: <Cloud className={iconClass} />,
        label: t('account-management.options.cloud-storage'),
      }
    case 'accountExport':
      return {
        link: { to: '/account-management/account-export' },
        icon: <Download className={iconClass} />,
        label: t('account-management.options.account-export'),
      }
    case 'redeemCodes':
      return {
        link: { to: '/account-management/redeem-codes' },
        icon: <Ticket className={iconClass} />,
        label: t('account-management.options.redeem-codes'),
      }
    case 'devicesAuth':
      return {
        link: { to: '/account-management/devices-auth' },
        icon: <MonitorSmartphone className={iconClass} />,
        label: t('account-management.options.devices-auth'),
        disabled: !areThereAccounts,
      }
    case 'epicGamesSettings':
      return {
        link: { to: '/account-management/epic-games-settings' },
        icon: <Settings className={iconClass} />,
        label: t('account-management.options.epic-settings'),
        disabled: !areThereAccounts,
      }
    case 'eula':
      return {
        link: { to: '/account-management/eula' },
        icon: <FileText className={iconClass} />,
        label: 'EULA',
        disabled: !areThereAccounts,
      }
    case 'matchmakingTrack':
      return {
        link: { to: '/advanced-mode/matchmaking-track' },
        icon: <Radar className={iconClass} />,
        label: t('advanced-mode.options.matchmaking-track'),
        disabled: !areThereAccounts,
      }
    case 'worldInfo':
      return {
        link: { to: '/advanced-mode/world-info' },
        icon: <Globe className={iconClass} />,
        label: t('advanced-mode.options.world-info'),
      }
    case 'authorizationCode':
      return {
        link: { to: '/accounts/add/$type', params: { type: 'authorization-code' } },
        icon: <Key className={iconClass} />,
        label: t('accounts.options.auth'),
      }
    case 'exchangeCode':
      return {
        link: { to: '/accounts/add/$type', params: { type: 'exchange-code' } },
        icon: <ArrowLeftRight className={iconClass} />,
        label: t('accounts.options.exchange'),
      }
    case 'deviceAuth':
      return {
        link: { to: '/accounts/add/$type', params: { type: 'device-auth' } },
        icon: <Laptop className={iconClass} />,
        label: t('accounts.options.device'),
      }
    case 'removeAccount':
      return {
        link: { to: '/accounts/remove' },
        icon: <UserMinus className={iconClass} />,
        label: t('accounts.options.remove'),
        disabled: !areThereAccounts,
      }
  }
}

function StatusBadge({
  status,
  t,
}: {
  status: string
  t: TFunction
}) {
  return (
    <span
      className={cn(
        'border flex font-bold items-center leading-none px-2 rounded text-[0.65rem] uppercase',
        status === AutomationStatusType.ISSUE
          ? 'border-yellow-600 text-yellow-600'
          : 'border-green-600 text-green-600',
      )}
    >
      {status === AutomationStatusType.ISSUE
        ? t('stw-operations.auto-kick-status.issue')
        : t('stw-operations.auto-kick-status.active')}
    </span>
  )
}

export const SidebarTitle = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ className?: string }>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-wrap items-center px-3 py-2 rounded-lg',
        'text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})

const Title = SidebarTitle
