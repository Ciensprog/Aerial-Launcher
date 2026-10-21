import type { DragEvent } from 'react'
import type {
  MenuCategory,
  MenuFeatureKey,
} from '../../../lib/settings/menu-layout'

import { GripVertical } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../../../components/ui/context-menu'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'

import {
  useCustomizableMenuSettingsActions,
  useCustomizableMenuSettingsVisibility,
} from '../../../hooks/settings'
import { useCustomizableMenuSettingsStore } from '../../../state/settings/customizable-menu'

import {
  createMenuCategoryId,
  isBuiltinCategoryId,
  isMenuFeatureKey,
  moveMenuItem,
  normalizeMenuCategories,
  reorderMenuCategories,
} from '../../../lib/settings/menu-layout'
import { cn } from '../../../lib/utils'

const ITEM_PREFIX = 'item:'
const CATEGORY_PREFIX = 'category:'

type DropTarget =
  | {
      kind: 'category'
      id: string
      place: 'before' | 'after' | 'on'
    }
  | {
      kind: 'item'
      categoryId: string
      item: MenuFeatureKey
      place: 'before' | 'after'
    }

export function CustomizableMenu() {
  const { t } = useTranslation(['settings', 'sidebar'])
  const data = useCustomizableMenuSettingsStore((state) => state.data)
  const { updateMenuOption, updateMenuLayout } =
    useCustomizableMenuSettingsActions()
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  const categories = useMemo(
    () => normalizeMenuCategories(data.categories, data),
    [data],
  )

  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const dragKindRef = useRef<'item' | 'category' | null>(null)
  const dropTargetRef = useRef(dropTarget)
  dropTargetRef.current = dropTarget
  const [dialog, setDialog] = useState<
    | { type: 'add' }
    | { type: 'rename'; categoryId: string; name: string }
    | null
  >(null)
  const [draftName, setDraftName] = useState('')

  const persist = (next: Array<MenuCategory>) => {
    updateMenuLayout(next)
  }

  const categoryTitle = (category: MenuCategory) => {
    const custom = category.name.trim()

    if (custom !== '') {
      return custom
    }

    return builtinCategoryTitle(category.id, t)
  }

  const openAdd = () => {
    setDraftName('')
    setDialog({ type: 'add' })
  }

  const openRename = (category: MenuCategory) => {
    setDraftName(categoryTitle(category))
    setDialog({
      type: 'rename',
      categoryId: category.id,
      name: categoryTitle(category),
    })
  }

  const handleDialogSave = () => {
    const name = draftName.trim()

    if (!dialog) {
      return
    }

    if (dialog.type === 'add') {
      persist([
        ...categories,
        {
          id: createMenuCategoryId(),
          name: name === '' ? t('custom-menu.category-fallback') : name,
          visible: true,
          items: [],
        },
      ])
    } else {
      persist(
        categories.map((category) =>
          category.id === dialog.categoryId
            ? { ...category, name }
            : category,
        ),
      )
    }

    setDialog(null)
  }

  const handleDelete = (categoryId: string) => {
    const index = categories.findIndex(
      (category) => category.id === categoryId,
    )

    if (index < 0) {
      return
    }

    const removed = categories[index]
    const remaining = categories.filter(
      (category) => category.id !== categoryId,
    )

    if (remaining.length <= 0) {
      persist([
        {
          id: createMenuCategoryId(),
          name: t('custom-menu.category-fallback'),
          visible: true,
          items: [...removed.items],
        },
      ])

      return
    }

    const targetIndex = Math.max(0, index - 1)
    persist(
      remaining.map((category, currentIndex) =>
        currentIndex === targetIndex
          ? {
              ...category,
              items: [...category.items, ...removed.items],
            }
          : category,
      ),
    )
  }

  const handleToggleCategory = (category: MenuCategory) => {
    return (checked: boolean) => {
      persist(
        categories.map((current) =>
          current.id === category.id
            ? { ...current, visible: checked }
            : current,
        ),
      )

      if (isBuiltinCategoryId(category.id)) {
        updateMenuOption(category.id)(checked)
      }
    }
  }

  const handleDragStartItem = (item: MenuFeatureKey) => {
    return (event: DragEvent<HTMLElement>) => {
      event.stopPropagation()
      dragKindRef.current = 'item'
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', `${ITEM_PREFIX}${item}`)
    }
  }

  const handleDragStartCategory = (categoryId: string) => {
    return (event: DragEvent<HTMLElement>) => {
      event.stopPropagation()
      dragKindRef.current = 'category'
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData(
        'text/plain',
        `${CATEGORY_PREFIX}${categoryId}`,
      )
    }
  }

  const clearDrag = () => {
    dragKindRef.current = null
    setDropTarget(null)
  }

  const parseDrag = (event: DragEvent<HTMLElement>) => {
    const raw = event.dataTransfer.getData('text/plain')

    if (raw.startsWith(ITEM_PREFIX)) {
      const key = raw.slice(ITEM_PREFIX.length)

      return isMenuFeatureKey(key) ? { type: 'item' as const, key } : null
    }

    if (raw.startsWith(CATEGORY_PREFIX)) {
      return {
        type: 'category' as const,
        id: raw.slice(CATEGORY_PREFIX.length),
      }
    }

    return null
  }

  const handleDragOver = (categoryId: string) => {
    return (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'

      if (dragKindRef.current === 'category') {
        const rect = event.currentTarget.getBoundingClientRect()
        const place =
          event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'

        setDropTarget({ kind: 'category', id: categoryId, place })

        return
      }

      setDropTarget({ kind: 'category', id: categoryId, place: 'on' })
    }
  }

  const handleDragOverItem = (
    categoryId: string,
    item: MenuFeatureKey,
  ) => {
    return (event: DragEvent<HTMLElement>) => {
      if (dragKindRef.current !== 'item') {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = 'move'

      const rect = event.currentTarget.getBoundingClientRect()
      const place =
        event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'

      setDropTarget({
        kind: 'item',
        categoryId,
        item,
        place,
      })
    }
  }

  const handleDrop = (categoryId: string) => {
    return (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()

      const currentDrop = dropTargetRef.current
      const payload = parseDrag(event)

      clearDrag()

      if (!payload) {
        return
      }

      if (payload.type === 'item') {
        persist(moveMenuItem(categories, payload.key, categoryId))

        return
      }

      const place =
        currentDrop?.kind === 'category' && currentDrop.id === categoryId
          ? currentDrop.place
          : 'before'

      persist(
        reorderMenuCategories(
          categories,
          payload.id,
          categoryId,
          place === 'after' ? 'after' : 'before',
        ),
      )
    }
  }

  const handleDropItem = (
    categoryId: string,
    target: MenuFeatureKey,
  ) => {
    return (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()

      const currentDrop = dropTargetRef.current
      const payload = parseDrag(event)

      clearDrag()

      if (!payload || payload.type !== 'item' || payload.key === target) {
        return
      }

      const category = categories.find((row) => row.id === categoryId)
      const without = (category?.items ?? []).filter(
        (item) => item !== payload.key,
      )
      const targetIndex = without.indexOf(target)
      const place =
        currentDrop?.kind === 'item' &&
        currentDrop.categoryId === categoryId &&
        currentDrop.item === target
          ? currentDrop.place
          : 'before'
      const toIndex =
        targetIndex < 0
          ? without.length
          : place === 'after'
            ? targetIndex + 1
            : targetIndex

      persist(moveMenuItem(categories, payload.key, categoryId, toIndex))
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardDescription>{t('custom-menu.description')}</CardDescription>
      </CardHeader>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <CardContent
            className={cn(
              'p-6 space-y-4 min-h-[16rem]',
              '[&_.category:not(:last-child)]:border-b [&_.category:not(:last-child)]:pb-4',
              '[&_.list]:gap-x-6 [&_.list]:gap-y-1 [&_.list]:grid [&_.list]:grid-cols-2',
              '[&_.title]:flex-1 [&_.title]:cursor-pointer [&_.title]:leading-4',
              '[&_.item]:flex [&_.item]:items-center [&_.item]:justify-between [&_.item.main]:mb-2',
            )}
            onDragEnd={clearDrag}
          >
            {categories.map((category) => (
              <CategoryBlock
                key={category.id}
                category={category}
                title={categoryTitle(category)}
                dropPlace={
                  dropTarget?.kind === 'category' &&
                  dropTarget.id === category.id
                    ? dropTarget.place
                    : null
                }
                itemDrop={
                  dropTarget?.kind === 'item' &&
                  dropTarget.categoryId === category.id
                    ? { item: dropTarget.item, place: dropTarget.place }
                    : null
                }
                getMenuOptionVisibility={getMenuOptionVisibility}
                updateMenuOption={updateMenuOption}
                onRename={() => openRename(category)}
                onDelete={() => handleDelete(category.id)}
                onToggle={handleToggleCategory(category)}
                onDragStartItem={handleDragStartItem}
                onDragStartCategory={handleDragStartCategory(category.id)}
                onDragOver={handleDragOver(category.id)}
                onDragOverItem={handleDragOverItem}
                onDragLeave={() => setDropTarget(null)}
                onDrop={handleDrop(category.id)}
                onDropItem={handleDropItem}
              />
            ))}
          </CardContent>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={openAdd}>
            {t('custom-menu.add-category')}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null)
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {dialog?.type === 'rename'
                ? t('custom-menu.rename-category')
                : t('custom-menu.add-category')}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={draftName}
            placeholder={t('custom-menu.category-name')}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleDialogSave()
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialog(null)}
            >
              {t('custom-menu.cancel')}
            </Button>
            <Button onClick={handleDialogSave}>
              {t('custom-menu.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function CategoryBlock({
  category,
  title,
  dropPlace,
  itemDrop,
  getMenuOptionVisibility,
  updateMenuOption,
  onRename,
  onDelete,
  onToggle,
  onDragStartItem,
  onDragStartCategory,
  onDragOver,
  onDragOverItem,
  onDragLeave,
  onDrop,
  onDropItem,
}: {
  category: MenuCategory
  title: string
  dropPlace: 'before' | 'after' | 'on' | null
  itemDrop: { item: MenuFeatureKey; place: 'before' | 'after' } | null
  getMenuOptionVisibility: (key: MenuFeatureKey) => boolean
  updateMenuOption: (
    key: MenuFeatureKey,
  ) => (visibility: boolean) => void
  onRename: () => void
  onDelete: () => void
  onToggle: (checked: boolean) => void
  onDragStartItem: (
    item: MenuFeatureKey,
  ) => (event: DragEvent<HTMLElement>) => void
  onDragStartCategory: (event: DragEvent<HTMLElement>) => void
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDragOverItem: (
    categoryId: string,
    item: MenuFeatureKey,
  ) => (event: DragEvent<HTMLElement>) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent<HTMLElement>) => void
  onDropItem: (
    categoryId: string,
    item: MenuFeatureKey,
  ) => (event: DragEvent<HTMLElement>) => void
}) {
  const { t } = useTranslation(['settings', 'sidebar'])
  const switchId = `menu-category-${category.id}`
  const showList = category.items.length > 0

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          data-category-id={category.id}
          className={cn(
            'category relative rounded-md',
            dropPlace === 'on' && 'ring-1 ring-amber-400/80',
          )}
          onContextMenu={(event) => {
            event.stopPropagation()
          }}
          onDragOver={onDragOver}
          onDragLeave={(event) => {
            const related = event.relatedTarget

            if (
              related instanceof Node &&
              event.currentTarget.contains(related)
            ) {
              return
            }

            onDragLeave()
          }}
          onDrop={onDrop}
        >
          {dropPlace === 'before' ? (
            <div className="absolute -top-2 right-0 left-0 h-0.5 rounded-full bg-amber-400" />
          ) : null}
          {dropPlace === 'after' ? (
            <div className="absolute -bottom-2 right-0 left-0 h-0.5 rounded-full bg-amber-400" />
          ) : null}
          <div className="item main">
            <span
              className="cursor-grab text-muted-foreground/70 shrink-0 px-0.5"
              title={t('custom-menu.reorder-category')}
              draggable
              onDragStart={onDragStartCategory}
            >
              <GripVertical className="size-4" />
            </span>
            <Label
              className="title text-lg"
              htmlFor={switchId}
            >
              {title}
            </Label>
            <Switch
              id={switchId}
              checked={category.visible}
              onCheckedChange={onToggle}
            />
          </div>
          {showList ? (
            <div className="list">
              {category.items.map((item) => (
                <div
                  key={item}
                  className={cn(
                    'item relative',
                    itemDrop?.item === item &&
                      'ring-1 ring-amber-400/80 rounded-sm',
                  )}
                  draggable
                  onDragStart={onDragStartItem(item)}
                  onDragOver={onDragOverItem(category.id, item)}
                  onDrop={onDropItem(category.id, item)}
                >
                  {itemDrop?.item === item && itemDrop.place === 'before' ? (
                    <div className="absolute -top-0.5 right-0 left-0 h-0.5 rounded-full bg-amber-400" />
                  ) : null}
                  {itemDrop?.item === item && itemDrop.place === 'after' ? (
                    <div className="absolute -bottom-0.5 right-0 left-0 h-0.5 rounded-full bg-amber-400" />
                  ) : null}
                  <Label
                    className="title"
                    htmlFor={`menu-item-${item}`}
                  >
                    {featureLabel(item, t)}
                  </Label>
                  <Switch
                    id={`menu-item-${item}`}
                    checked={getMenuOptionVisibility(item)}
                    onCheckedChange={updateMenuOption(item)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-1 pb-1 text-xs text-muted-foreground">
              {t('custom-menu.empty-category')}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onRename}>
          {t('custom-menu.rename-category')}
        </ContextMenuItem>
        <ContextMenuItem onSelect={onDelete}>
          {t('custom-menu.delete-category')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function builtinCategoryTitle(
  id: string,
  t: ReturnType<typeof useTranslation>['t'],
) {
  switch (id) {
    case 'general':
      return 'General'
    case 'currentAlerts':
      return 'Current Alerts'
    case 'gamesLauncher':
      return t('games-launcher.title', { ns: 'sidebar' })
    case 'stwOperations':
      return t('stw-operations.title', { ns: 'sidebar' })
    case 'accountManagement':
      return t('account-management.title', { ns: 'sidebar' })
    case 'advancedMode':
      return t('advanced-mode.title', { ns: 'sidebar' })
    case 'myAccounts':
      return t('accounts.title', { ns: 'sidebar' })
    default:
      return t('custom-menu.category-fallback')
  }
}

function featureLabel(
  key: MenuFeatureKey,
  t: ReturnType<typeof useTranslation>['t'],
) {
  switch (key) {
    case 'currentAlerts':
      return 'Current Alerts'
    case 'gamesLauncher':
      return t('games-launcher.title', { ns: 'sidebar' })
    case 'autoKick':
      return t('stw-operations.options.auto-kick', { ns: 'sidebar' })
    case 'taxiService':
      return t('stw-operations.options.taxi-service', { ns: 'sidebar' })
    case 'party':
      return t('stw-operations.options.party', { ns: 'sidebar' })
    case 'dailyQuests':
      return t('stw-operations.options.daily-quests', { ns: 'sidebar' })
    case 'dqWeapons':
      return t('stw-operations.options.dq-weapons', { ns: 'sidebar' })
    case 'stormShields':
      return t('stw-operations.options.storm-shields', { ns: 'sidebar' })
    case 'xpBoosts':
      return t('stw-operations.options.xp-boosts', { ns: 'sidebar' })
    case 'autoPinUrns':
      return t('stw-operations.options.auto-pin-urns', { ns: 'sidebar' })
    case 'llamaManager':
      return t('stw-operations.options.llama-manager', { ns: 'sidebar' })
    case 'itemShop':
      return t('stw-operations.options.item-shop', { ns: 'sidebar' })
    case 'collectionBook':
      return t('stw-operations.options.collection-book', { ns: 'sidebar' })
    case 'accountInfo':
      return t('stw-operations.options.account-info', { ns: 'sidebar' })
    case 'vbucksInformation':
      return t('account-management.options.vbucks-information', {
        ns: 'sidebar',
      })
    case 'cloudStorage':
      return t('account-management.options.cloud-storage', { ns: 'sidebar' })
    case 'accountExport':
      return t('account-management.options.account-export', { ns: 'sidebar' })
    case 'redeemCodes':
      return t('account-management.options.redeem-codes', { ns: 'sidebar' })
    case 'devicesAuth':
      return t('account-management.options.devices-auth', { ns: 'sidebar' })
    case 'epicGamesSettings':
      return t('account-management.options.epic-settings', { ns: 'sidebar' })
    case 'eula':
      return 'EULA'
    case 'matchmakingTrack':
      return t('advanced-mode.options.matchmaking-track', { ns: 'sidebar' })
    case 'worldInfo':
      return t('advanced-mode.options.world-info', { ns: 'sidebar' })
    case 'showTotalAccounts':
      return t('accounts.options.show-total-accounts', { ns: 'sidebar' })
    case 'authorizationCode':
      return t('accounts.options.auth', { ns: 'sidebar' })
    case 'exchangeCode':
      return t('accounts.options.exchange', { ns: 'sidebar' })
    case 'deviceAuth':
      return t('accounts.options.device', { ns: 'sidebar' })
    case 'removeAccount':
      return t('accounts.options.remove', { ns: 'sidebar' })
  }
}
