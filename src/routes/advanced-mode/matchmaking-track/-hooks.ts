import type { XPBoostsSearchUserResponse } from '../../../types/xpboosts'

import { useEffect, useState } from 'react'

import {
  ComboboxOption,
  ComboboxProps,
} from '../../../components/ui/extended/combobox/hooks'

import { useMatchmakingPlayersPath } from '../../../hooks/advanced-mode/matchmaking'
import { useGetSelectedAccount } from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'

export function useCurrentActions({
  searchedUser,

  handleManualChangeSearchDisplayName,
}: {
  searchedUser: XPBoostsSearchUserResponse | null

  handleManualChangeSearchDisplayName: (value: string) => void
}) {
  const [isLoading, setIsLoading] = useState(false)

  const { selected } = useGetSelectedAccount()
  const { players } = useMatchmakingPlayersPath()

  const options: Array<ComboboxOption> = players.map((player) => ({
    keywords: [player.displayName, player.id],
    label: player.displayName,
    value: player.id,
  }))

  useEffect(() => {
    const listener = window.electronAPI.notificationMatchmakingSaveFile(
      async (response) => {
        setIsLoading(false)

        toast(
          response
            ? 'File has been updated successfully'
            : 'Specified player is probably not on a mission'
        )
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const customFilter: ComboboxProps['customFilter'] = (
    _value,
    search,
    keywords
  ) => {
    const _search = search.toLowerCase().trim()
    const _keys =
      keywords &&
      keywords.some((keyword) =>
        keyword.toLowerCase().trim().includes(_search)
      )

    return _keys ? 1 : 0
  }

  const autoCompletePlayer = (value: string) => {
    const currentPlayer = players.find((item) => item.id === value)

    handleManualChangeSearchDisplayName(currentPlayer?.displayName ?? '')
  }

  const handleSave = (accountId: string) => () => {
    if (!selected || !searchedUser?.data || isLoading) {
      return
    }

    setIsLoading(true)

    window.electronAPI.saveMatchmakingFile(selected, accountId)
  }

  return {
    isLoading,
    options,
    players,

    autoCompletePlayer,
    customFilter,
    handleSave,
  }
}
