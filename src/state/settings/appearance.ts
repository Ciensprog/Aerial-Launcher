import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Accent colours, named after the STW zones (see globals.css)
 */
export const accentColors = [
  'default',
  'stonewood',
  'plankerton',
  'canny-valley',
  'twine-peaks',
  'ventures',
] as const

export type AccentColor = (typeof accentColors)[number]

/**
 * Background variants. The app's artwork (logo, mission and survivor icons)
 * is white, so only dark backgrounds are offered
 */
export const backgroundStyles = ['dark', 'black', 'slate'] as const

export type BackgroundStyle = (typeof backgroundStyles)[number]

/**
 * Sidebar sections that can be reordered (My Accounts and the links at the
 * bottom stay fixed)
 */
export const sidebarSections = [
  'currentAlerts',
  'stwOperations',
  'accountManagement',
  'gamesLauncher',
  'advancedMode',
] as const

export type SidebarSection = (typeof sidebarSections)[number]

export type AppearanceState = {
  accent: AccentColor
  background: BackgroundStyle
  compactSidebar: boolean
  sidebarOrder: Array<SidebarSection>

  setAccent: (accent: AccentColor) => void
  setBackground: (background: BackgroundStyle) => void
  setCompactSidebar: (value: boolean) => void
  setSidebarOrder: (order: Array<SidebarSection>) => void
  resetSidebarOrder: () => void
}

/**
 * Keeps a stored order valid across app updates: drops unknown sections and
 * appends any new ones at their default position
 */
export function normalizeSidebarOrder(
  order: Array<string> | undefined,
): Array<SidebarSection> {
  const known = (order ?? []).filter(
    (item, index, list): item is SidebarSection =>
      sidebarSections.includes(item as SidebarSection) &&
      list.indexOf(item) === index,
  )

  sidebarSections.forEach((section, defaultIndex) => {
    if (!known.includes(section)) {
      known.splice(Math.min(defaultIndex, known.length), 0, section)
    }
  })

  return known
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      accent: 'default',
      background: 'dark',
      compactSidebar: false,
      sidebarOrder: [...sidebarSections],

      setAccent: (accent) => set({ accent }),
      setBackground: (background) => set({ background }),
      setCompactSidebar: (compactSidebar) => set({ compactSidebar }),
      setSidebarOrder: (order) =>
        set({ sidebarOrder: normalizeSidebarOrder(order) }),
      resetSidebarOrder: () => set({ sidebarOrder: [...sidebarSections] }),
    }),
    {
      name: 'aerial-appearance',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        accent: state.accent,
        background: state.background,
        compactSidebar: state.compactSidebar,
        sidebarOrder: state.sidebarOrder,
      }),
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<AppearanceState>

        return {
          ...current,
          accent: accentColors.includes(stored.accent as AccentColor)
            ? (stored.accent as AccentColor)
            : current.accent,
          background: backgroundStyles.includes(
            stored.background as BackgroundStyle,
          )
            ? (stored.background as BackgroundStyle)
            : current.background,
          compactSidebar: stored.compactSidebar ?? current.compactSidebar,
          sidebarOrder: normalizeSidebarOrder(stored.sidebarOrder),
        }
      },
    },
  ),
)
