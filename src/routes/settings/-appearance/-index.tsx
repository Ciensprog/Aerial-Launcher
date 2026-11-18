import type { DragEndEvent } from '@dnd-kit/core'
import type { CSSProperties } from 'react'
import type {
  AccentColor,
  BackgroundStyle,
  SidebarSection,
} from '../../../state/settings/appearance'

import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, GripVertical, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Button } from '../../../components/ui/button'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../components/ui/toggle-group'

import {
  accentColors,
  backgroundStyles,
  useAppearanceStore,
} from '../../../state/settings/appearance'

import { cn } from '../../../lib/utils'

/**
 * Preview colours for each background (the real values live in globals.css)
 */
const backgroundSwatches: Record<BackgroundStyle, string> = {
  dark: 'hsl(0 0% 3.9%)',
  black: 'hsl(0 0% 0%)',
  slate: 'hsl(222 47% 8%)',
}

/**
 * Swatch shown for each accent (the real colours live in globals.css)
 */
const accentSwatches: Record<AccentColor, string> = {
  default: 'hsl(var(--foreground))',
  stonewood: 'var(--zone-color-stonewood)',
  plankerton: 'var(--zone-color-plankerton)',
  'canny-valley': 'var(--zone-color-canny-valley)',
  'twine-peaks': 'var(--zone-color-twine-peaks)',
  ventures: 'var(--zone-color-ventures)',
}

export function Appearance() {
  return (
    <div className="flex flex-col gap-8">
      <ThemeSelector />
      <AccentSelector />
      <SidebarSettings />
    </div>
  )
}

function ThemeSelector() {
  const { t } = useTranslation(['settings'])
  const { background, setBackground } = useAppearanceStore(
    useShallow((state) => ({
      background: state.background,
      setBackground: state.setBackground,
    })),
  )

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-base">{t('appearance.theme.label')}</Label>
      <ToggleGroup
        className="grid grid-cols-3 gap-2"
        type="single"
        value={background}
        onValueChange={(value) => {
          if (value) {
            setBackground(value as BackgroundStyle)
          }
        }}
      >
        {backgroundStyles.map((value) => (
          <ToggleGroupItem
            className="gap-2 border data-[state=on]:border-primary"
            value={value}
            key={value}
          >
            <span
              className="border border-muted-foreground/40 rounded-full shrink-0 size-4"
              style={{ backgroundColor: backgroundSwatches[value] }}
            />
            {t(`appearance.theme.options.${value}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

function AccentSelector() {
  const { t } = useTranslation(['settings'])
  const { accent, setAccent } = useAppearanceStore(
    useShallow((state) => ({
      accent: state.accent,
      setAccent: state.setAccent,
    })),
  )

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="text-base">{t('appearance.accent.label')}</Label>
        <p className="text-muted-foreground text-sm">
          {t('appearance.accent.description')}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {accentColors.map((value) => {
          const isSelected = accent === value

          return (
            <button
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md border text-sm text-left transition-colors',
                'hover:bg-muted',
                {
                  'border-primary bg-muted': isSelected,
                },
              )}
              type="button"
              onClick={() => setAccent(value)}
              aria-pressed={isSelected}
              key={value}
            >
              <span
                className="flex items-center justify-center rounded-full shrink-0 size-5"
                style={{ backgroundColor: accentSwatches[value] }}
              >
                {isSelected && (
                  <Check className="size-3.5 text-background stroke-[3]" />
                )}
              </span>
              <span className="truncate">
                {t(`appearance.accent.options.${value}`)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SidebarSettings() {
  const { t } = useTranslation(['settings'])
  const {
    compactSidebar,
    resetSidebarOrder,
    setCompactSidebar,
    setSidebarOrder,
    sidebarOrder,
  } = useAppearanceStore(
    useShallow((state) => ({
      compactSidebar: state.compactSidebar,
      resetSidebarOrder: state.resetSidebarOrder,
      setCompactSidebar: state.setCompactSidebar,
      setSidebarOrder: state.setSidebarOrder,
      sidebarOrder: state.sidebarOrder,
    })),
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return
    }

    setSidebarOrder(
      arrayMove(
        sidebarOrder,
        sidebarOrder.indexOf(active.id as SidebarSection),
        sidebarOrder.indexOf(over.id as SidebarSection),
      ),
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-base">{t('appearance.sidebar.label')}</Label>

      <div className="flex items-center justify-between gap-4">
        <Label
          className="font-normal"
          htmlFor="appearance-compact-sidebar"
        >
          {t('appearance.sidebar.compact')}
        </Label>
        <Switch
          id="appearance-compact-sidebar"
          checked={compactSidebar}
          onCheckedChange={setCompactSidebar}
        />
      </div>

      <div className="flex items-end justify-between gap-4 mt-2">
        <p className="text-muted-foreground text-sm">
          {t('appearance.sidebar.order-description')}
        </p>
        <Button
          className="gap-1.5 shrink-0"
          size="sm"
          variant="ghost"
          onClick={resetSidebarOrder}
        >
          <RotateCcw className="size-3.5" />
          {t('appearance.sidebar.reset')}
        </Button>
      </div>

      <DndContext
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={sidebarOrder}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-1.5">
            {sidebarOrder.map((section) => (
              <SortableSection
                section={section}
                key={section}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableSection({ section }: { section: SidebarSection }) {
  const { t } = useTranslation(['sidebar', 'general'])
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  }

  const labels: Record<SidebarSection, string> = {
    currentAlerts: t('general:go-to-current-alerts'),
    stwOperations: t('stw-operations.title'),
    accountManagement: t('account-management.title'),
    gamesLauncher: t('games-launcher.title'),
    advancedMode: t('advanced-mode.title'),
  }

  return (
    <li
      ref={setNodeRef}
      className={cn(
        'bg-background border flex items-center gap-2 rounded-md text-sm select-none',
        'cursor-grab touch-none',
        {
          'border-primary cursor-grabbing shadow-lg': isDragging,
        },
      )}
      style={style}
      {...attributes}
      {...listeners}
    >
      <span className="bg-muted-foreground/5 flex items-center px-2 py-2 rounded-l-md">
        <GripVertical className="size-4 text-muted-foreground" />
      </span>
      {labels[section]}
    </li>
  )
}
