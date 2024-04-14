import { useState } from 'react'

import { useGetSelectedAccount } from '../../hooks/accounts'

export function useAttributesStates() {
  const [open, setOpen] = useState(false)
  const { selected } = useGetSelectedAccount()

  const isButtonDisabled =
    selected === null || selected.token === undefined

  return {
    isButtonDisabled,
    open,

    setOpen,
  }
}
