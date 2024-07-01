import { useUISidebarHistoryStore } from '../../state/ui/sidebars/history'

export function useUISidebarHistory() {
  const { changeVisibility, visibility } = useUISidebarHistoryStore()

  return {
    changeVisibility,
    visibility,
  }
}
