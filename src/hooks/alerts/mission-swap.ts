import { useShallow } from 'zustand/react/shallow'

import { useMissionSwapStore } from '../../state/alerts/mission-swap'

export function useMissionSwapData() {
  return useMissionSwapStore(
    useShallow((state) => ({
      yesterdayFilename: state.yesterdayFilename,
      yesterdayPath: state.yesterdayPath,
      yesterdayRaw: state.yesterdayRaw,
      yesterdayWorldInfo: state.yesterdayWorldInfo,
      yesterdayManual: state.yesterdayManual,
      yesterdayMissing: state.yesterdayMissing,
      selected: state.selected,
      onlyDifferent: state.onlyDifferent,
      onlyAlerts: state.onlyAlerts,
    })),
  )
}

export function useMissionSwapActions() {
  return useMissionSwapStore(
    useShallow((state) => ({
      clearYesterday: state.clearYesterday,
      setOnlyAlerts: state.setOnlyAlerts,
      setOnlyDifferent: state.setOnlyDifferent,
      setSelected: state.setSelected,
      setYesterday: state.setYesterday,
      setYesterdayMissing: state.setYesterdayMissing,
      toggleSelected: state.toggleSelected,
    })),
  )
}
