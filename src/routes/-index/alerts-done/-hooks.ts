import type { ChangeEventHandler, MouseEventHandler } from 'react'
import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'
import type {
  ComboboxOption,
  ComboboxProps,
} from '../../../components/ui/extended/combobox/hooks'

import { Collection } from '@discordjs/collection'
import { useMemo, useRef } from 'react'

import { stwNewsProfileURL } from '../../../config/fortnite/links'

import { useWorldInfo } from '../../../hooks/advanced-mode/world-info'
import {
  useAlertsDoneData,
  useAlertsDoneForm,
} from '../../../hooks/alerts/alerts-done'
import { useGetAccounts } from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'

import { checkIfCustomDisplayNameIsValid } from '../../../lib/validations/properties'
import { sortRewardsSummary } from '../../../lib/parsers/resources'
import { toDate } from '../../../lib/dates'
import { imgResources, imgWorld } from '../../../lib/repository'
import { parseCustomDisplayName } from '../../../lib/utils'

export function useFormData() {
  const $submitButton = useRef<HTMLButtonElement>(null)
  const { accountsArray } = useGetAccounts()
  const { getGroupTagsByAccountId } = useGetGroups()
  const {
    inputSearch,
    searchIsSubmitting,
    changeInputSearch,
    updateSearchIsSubmitting,
  } = useAlertsDoneForm()

  const formDisabled = accountsArray.length <= 0

  const inputSearchButtonIsDisabled =
    searchIsSubmitting || inputSearch.trim() === ''

  const options = accountsArray.map((account) => {
    const _keys: Array<string> = [account.displayName]
    const tags = getGroupTagsByAccountId(account.accountId)

    if (checkIfCustomDisplayNameIsValid(account.customDisplayName)) {
      _keys.push(account.customDisplayName)
    }

    if (tags.length > 0) {
      tags.forEach((tagName) => {
        _keys.push(tagName)
      })
    }

    return {
      keywords: _keys,
      label: parseCustomDisplayName(account),
      value: account.accountId,
    } as ComboboxOption
  })
  const accountSelectorIsDisabled =
    options.length <= 0 || searchIsSubmitting

  const handleChangeSearchDisplayName: ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    const value = event.target.value

    changeInputSearch(value)
  }

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

  const onSelectItem = (accountId: string) => {
    handleSearchPlayer(accountId)
  }

  const handleSearchPlayer = (value?: string) => {
    const toSearch = value ?? inputSearch.trim()

    changeInputSearch(toSearch)
    updateSearchIsSubmitting(true)

    window.electronAPI.fetchPlayerData({
      accounts: accountsArray,
      inputSearch: toSearch,
    })
  }

  return {
    $submitButton,
    accountSelectorIsDisabled,
    formDisabled,
    inputSearchButtonIsDisabled,
    inputSearch,
    options,
    searchIsSubmitting,

    customFilter,
    handleChangeSearchDisplayName,
    handleSearchPlayer,
    onSelectItem,
  }
}

export function usePlayerDataActions() {
  const handleOpenExternalFNDBProfileUrl =
    (accountId: string): MouseEventHandler<HTMLAnchorElement> =>
    (event) => {
      event.preventDefault()

      window.electronAPI.openExternalURL(stwNewsProfileURL(accountId))
    }

  return {
    handleOpenExternalFNDBProfileUrl,
  }
}

export function usePlayerData() {
  const { data } = useWorldInfo()
  const { playerData } = useAlertsDoneData()

  const { missions, rewards } = useMemo(() => {
    const myAlerts =
      playerData?.data?.profileChanges?.profile.stats.attributes
        .mission_alert_redemption_record?.claimData ?? []

    const tmpRewards: Record<
      string,
      {
        imageUrl: string
        quantity: number
      }
    > = {}
    const missions = data
      .entries()
      .reduce(
        (accumulator, [, missions]) => {
          missions.forEach((mission) => {
            if (mission.raw.alert) {
              const currentAlert = myAlerts.find(
                (item) =>
                  item.missionAlertId ===
                  mission.raw.alert?.missionAlertGuid
              )

              if (currentAlert) {
                accumulator.set(mission.raw.mission.missionGuid, {
                  ...mission,
                  redemptionDateUtc: toDate(
                    currentAlert.redemptionDateUtc
                  ),
                })

                mission.ui.alert.rewards.forEach((reward) => {
                  const { itemId } = reward

                  if (
                    itemId.startsWith('AccountResource:') ||
                    itemId.startsWith('Ingredient:')
                  ) {
                    if (!tmpRewards[reward.itemId]) {
                      tmpRewards[reward.itemId] = {
                        imageUrl: reward.imageUrl,
                        quantity: 0,
                      }
                    }

                    tmpRewards[reward.itemId].quantity += reward.quantity
                  } else {
                    const itemPrefix = itemId.split(':')[0]

                    if (!tmpRewards[itemPrefix]) {
                      const images: Record<string, string> = {
                        Defender: imgResources(
                          'voucher_generic_defender.png'
                        ),
                        Hero: imgResources('voucher_generic_hero.png'),
                        Schematic: imgResources(
                          'voucher_generic_schematic_r.png'
                        ),
                        Worker: imgResources('voucher_generic_worker.png'),
                      }

                      tmpRewards[itemPrefix] = {
                        imageUrl:
                          images[itemPrefix] ?? imgWorld('question.png'),
                        quantity: 0,
                      }
                    }

                    tmpRewards[itemPrefix].quantity += reward.quantity
                  }
                })
              }
            }
          })

          return accumulator
        },
        new Collection<
          string,
          WorldInfoMission & {
            redemptionDateUtc: Date
          }
        >()
      )
      .toSorted(
        (itemA, itemB) =>
          itemB.redemptionDateUtc.valueOf() -
          itemA.redemptionDateUtc.valueOf()
      )
    const rewards = sortRewardsSummary(tmpRewards)

    return {
      missions,
      rewards,
    }
  }, [data, playerData])

  return {
    missions,
    rewards,
  }
}
