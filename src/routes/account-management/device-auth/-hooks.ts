import type { DeviceAuthInfoWithStates } from '../../../state/accounts/devices-auth'
import type { AccountData } from '../../../types/accounts'

import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { bots } from '../../../config/constants/bots'

import { useHandleRemove } from '../../accounts/remove/-actions'

import {
  useDevicesAuthActions,
  useDevicesAuthData,
} from '../../../hooks/management/devices-auth'
import { useGetSelectedAccount } from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'

export function useData() {
  const navigate = useNavigate()
  const { selected } = useGetSelectedAccount()
  const { data, isFetching } = useDevicesAuthData()
  const { removeDevice, syncData, updateDeletingState, updateFetching } =
    useDevicesAuthActions()
  const { handleRemove } = useHandleRemove()

  const disabledFetchButton = isFetching || !selected

  useEffect(() => {
    const listener = window.electronAPI.notificationDevicesAuthData(
      async (devices) => {
        syncData(devices)
        updateFetching(false)

        if (devices.length <= 0) {
          toast('No devices found')
        }
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.notificationDevicesAuthRemove(
      async (account, deviceId, status) => {
        updateDeletingState(deviceId, false)

        if (status) {
          removeDevice(deviceId)
        }

        const deviceIdText = `${deviceId.slice(0, 3)}•••`

        if (account.deviceId === deviceId) {
          handleRemove({
            defaultRedirect: false,
          })
          syncData([])
          navigate({ to: '/' })

          return
        }

        toast(
          status
            ? `DeviceId ${deviceIdText} was removed successfully`
            : `An error occurred while trying to remove deviceId: ${deviceIdText}`
        )
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleFetchDevices = () => {
    if (!selected) {
      return
    }

    updateFetching(true)

    window.electronAPI.devicesAuthRequestData(selected)
  }

  return {
    data,
    disabledFetchButton,
    isFetching,
    selected,

    handleFetchDevices,
  }
}

export function useActions() {
  const { isFetching } = useDevicesAuthData()
  const { updateDeletingState } = useDevicesAuthActions()

  const handleRemoveDevice =
    (account: AccountData, data: DeviceAuthInfoWithStates) => () => {
      if (data.isDeleting) {
        return
      }

      updateDeletingState(data.deviceId, true)
      window.electronAPI.devicesAuthRemove(account, data.deviceId)
    }

  return {
    isFetching,

    handleRemoveDevice,
  }
}

export function useParseIdentities({
  data,
}: {
  data: DeviceAuthInfoWithStates
}) {
  const { selected } = useGetSelectedAccount()

  const getIdentities = () => {
    if (!selected) {
      return []
    }

    const identities: Array<string> = []

    if (selected.deviceId === data.deviceId) {
      identities.push('Aerial Launcher')
    }

    bots.forEach((bot) => {
      if (data.created.ipAddress === bot.server) {
        identities.push(bot.name)
      }
    })

    return identities
  }

  return {
    identities: getIdentities(),
  }
}
