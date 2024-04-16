import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useShallow } from 'zustand/react/shallow'

import { requestData } from '../../../../bootstrap/components/load-accounts'

import { useAccountListStore } from '../../../../state/accounts/list'

import { toast } from '../../../../lib/notifications'

const formSchema = z.object({
  code: z.string().length(32, {
    message: '❌ Invalid code',
  }),
})

export function useSetupForm() {
  const { addOrUpdate, changeSelected, register } = useAccountListStore(
    useShallow((state) => ({
      addOrUpdate: state.addOrUpdate,
      changeSelected: state.changeSelected,
      register: state.register,
    }))
  )
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  })

  useEffect(() => {
    const listener = window.electronAPI.responseAuthWithAuthorization(
      async ({ data, error }) => {
        if (data) {
          const accountsToArray = Object.values(data.accounts)

          register({
            [data.currentAccount.accountId]: data.currentAccount,
          })

          if (accountsToArray.length <= 1) {
            changeSelected(accountsToArray[0].accountId)
          }

          requestData(data.currentAccount)
            .then((response) => {
              addOrUpdate(response.accountId, {
                ...data.currentAccount,
                provider: response.provider ?? null,
                token: response.token ?? null,
              })
            })
            .catch(() => {
              addOrUpdate(data.currentAccount.accountId, {
                ...data.currentAccount,
                provider: null,
                token: null,
              })
            })

          toast(`New account added: ${data.currentAccount.displayName}`)
        } else if (error) {
          toast(error ?? 'Unknown error :c')
        }
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    window.electronAPI.createAuthWithAuthorization(values.code)
    form.reset()
  }

  return { form, onSubmit }
}
