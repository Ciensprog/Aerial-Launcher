import type { AccountDataRecord } from '../../../types/accounts'
import type {
  PartyStatusAccountData,
  PartyStatusMember,
} from '../../../types/party'

import { useEffect, useState } from 'react'

import { UpdateIcon } from '@radix-ui/react-icons'
import { CrownIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { AccountSelectors } from '../../../components/selectors/accounts'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'
import { useGetAccounts } from '../../../hooks/accounts'
import {
  useGetPartyStatusActions,
  useGetPartyStatusData,
} from '../../../hooks/stw-operations/party-status'
import { usePartyStatusStore } from '../../../state/stw-operations/party-status'

import { toast } from '../../../lib/notifications'
import { cn, parseCustomDisplayName } from '../../../lib/utils'

export function PartyStatusCard() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const { results, isLoading, busyAccountId } = usePartyStatusStore(
    useShallow((state) => ({
      results: state.results,
      isLoading: state.isLoading,
      busyAccountId: state.busyAccountId,
    }))
  )
  const setLoading = usePartyStatusStore((state) => state.setLoading)
  const setBusyAccountId = usePartyStatusStore(
    (state) => state.setBusyAccountId
  )

  const { accountList } = useGetAccounts()
  const { selectedAccounts, selectedTags } = useGetPartyStatusData()
  const { partyStatusUpdateAccounts, partyStatusUpdateTags } =
    useGetPartyStatusActions()
  const {
    accounts,
    areThereAccounts,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    getAccounts,
  } = useAccountSelectorData({
    selectedAccounts,
    selectedTags,
  })

  const [selectedMember, setSelectedMember] = useState<{
    accountId: string
    memberId: string
  } | null>(null)

  useEffect(() => {
    if (!selectedMember) {
      return
    }

    const account = results.find(
      (item) => item.accountId === selectedMember.accountId
    )
    const member = account?.members.find(
      (item) => item.accountId === selectedMember.memberId
    )

    if (!account?.inParty || !member) {
      setSelectedMember(null)
    }
  }, [results, selectedMember])

  const fetchButtonIsDisabled =
    isSelectedEmpty || isLoading || !areThereAccounts

  const handleFetch = () => {
    if (fetchButtonIsDisabled) {
      return
    }

    const selected = getAccounts()

    if (selected.length <= 0) {
      toast(
        t('form.accounts.no-linked', {
          ns: 'general',
        })
      )

      return
    }

    setSelectedMember(null)
    setLoading(true)
    window.electronAPI.requestPartyStatus(selected)
  }

  const handleAction = (
    accountId: string,
    run: (account: (typeof accountList)[string]) => void
  ) => {
    const account = accountList[accountId]

    if (!account || busyAccountId) {
      return
    }

    setBusyAccountId(accountId)
    run(account)
  }

  return (
    <Card className="w-full">
      <div className="flex items-center gap-2 p-2">
        <AccountSelectors
          hideTags
          layout="row"
          accountsPlaceholder={t('form.accounts.select', {
            ns: 'general',
          })}
          accounts={{
            options: accounts,
            value: parsedSelectedAccounts,
          }}
          tags={{
            options: tags,
            value: parsedSelectedTags,
          }}
          onUpdateAccounts={partyStatusUpdateAccounts}
          onUpdateTags={partyStatusUpdateTags}
        />
        <Button
          className="h-8 shrink-0 px-3"
          size="sm"
          onClick={handleFetch}
          disabled={fetchButtonIsDisabled}
        >
          {isLoading ? (
            <UpdateIcon className="animate-spin" />
          ) : (
            t('party.status.form.submit-button')
          )}
        </Button>
      </div>

      <CardContent className="max-h-40 overflow-y-auto border-t p-0">
          {results.length <= 0 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              {t('party.status.empty')}
            </div>
          ) : (
            <div className="divide-y">
              {results.map((account) => {
                const accountData = accountList[account.accountId]
                const displayName = accountData
                  ? parseCustomDisplayName(accountData)
                  : account.accountId
                const isBusy = isLoading || busyAccountId !== null
                const selected =
                  selectedMember?.accountId === account.accountId
                    ? selectedMember.memberId
                    : null
                const selectedData = selected
                  ? account.members.find(
                      (member) => member.accountId === selected
                    )
                  : null
                const leader = findLeaderAccount(account, accountList)
                const canManage = leader !== null

                return (
                  <AccountParty
                    key={account.accountId}
                    account={account}
                    displayName={displayName}
                    isBusy={isBusy}
                    canManage={canManage}
                    selectedMemberId={selected}
                    selectedMember={selectedData ?? null}
                    onSelectMember={(memberId) => {
                      const member = account.members.find(
                        (item) => item.accountId === memberId
                      )

                      if (!member) {
                        return
                      }

                      setSelectedMember({
                        accountId: account.accountId,
                        memberId,
                      })
                    }}
                    onCloseDrawer={() => setSelectedMember(null)}
                    onLeave={() => {
                      handleAction(account.accountId, (current) => {
                        window.electronAPI.leavePartyStatus(current)
                      })
                    }}
                    onPromote={() => {
                      if (!selected || !leader) {
                        return
                      }

                      handleAction(leader.accountId, (current) => {
                        window.electronAPI.promotePartyStatusMember(
                          current,
                          selected
                        )
                      })
                    }}
                    onKick={() => {
                      if (!selected || !leader) {
                        return
                      }

                      handleAction(leader.accountId, (current) => {
                        window.electronAPI.kickPartyStatusMember(
                          current,
                          selected
                        )
                      })
                    }}
                  />
                )
              })}
            </div>
          )}
      </CardContent>
    </Card>
  )
}

function findLeaderAccount(
  party: PartyStatusAccountData,
  accountList: AccountDataRecord
) {
  const captainId = party.members.find(
    (member) => member.role === 'CAPTAIN'
  )?.accountId

  if (!captainId) {
    return null
  }

  return accountList[captainId] ?? null
}

function AccountParty({
  account,
  displayName,
  isBusy,
  canManage,
  selectedMemberId,
  selectedMember,
  onSelectMember,
  onCloseDrawer,
  onLeave,
  onPromote,
  onKick,
}: {
  account: PartyStatusAccountData
  displayName: string
  isBusy: boolean
  canManage: boolean
  selectedMemberId: string | null
  selectedMember: PartyStatusMember | null
  onSelectMember: (memberId: string) => void
  onCloseDrawer: () => void
  onLeave: () => void
  onPromote: () => void
  onKick: () => void
}) {
  const { t } = useTranslation(['stw-operations'])

  return (
    <div className="px-3 py-1">
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold text-[#e9c4cc]">
          {displayName}
        </div>
        {account.inParty ? (
          <>
            <Badge
              variant="secondary"
              className={cn(
                'font-medium text-[11px]',
                account.isLeader && 'bg-amber-900/70 text-amber-300'
              )}
            >
              {account.isLeader
                ? t('party.status.leader')
                : t('party.status.member')}
            </Badge>
            <Badge
              variant="secondary"
              className="font-medium text-[11px] tabular-nums"
            >
              {t('party.status.size', {
                current: account.memberCount,
                max: account.maxSize,
              })}
            </Badge>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={isBusy}
                onClick={onLeave}
              >
                {isBusy ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  t('party.status.leave')
                )}
              </Button>
            </div>
          </>
        ) : null}
      </div>

      {account.errorMessage ? (
        <div className="border-l-4 border-red-400 mt-2 pl-2 text-red-400 text-sm">
          {account.errorMessage}
        </div>
      ) : !account.inParty ? (
        <div className="mt-1.5 text-sm text-muted-foreground">
          {t('party.status.not-in-party')}
        </div>
      ) : (
        <>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {account.members.map((member) => (
              <MemberChip
                key={member.accountId}
                member={member}
                isActive={selectedMemberId === member.accountId}
                onSelect={() => onSelectMember(member.accountId)}
              />
            ))}
          </div>

          {selectedMember ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-[10px] border border-amber-800/40 bg-gradient-to-b from-[#1c1917] to-[#141210] px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-muted-foreground">
                  {t('party.status.manage')}
                </div>
                <div className="truncate font-extrabold">
                  {selectedMember.displayName}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={
                  isBusy ||
                  !canManage ||
                  selectedMember.role === 'CAPTAIN'
                }
                onClick={onPromote}
              >
                {t('party.status.promote')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={
                  isBusy ||
                  !canManage ||
                  selectedMember.role === 'CAPTAIN' ||
                  selectedMember.isYou
                }
                onClick={onKick}
              >
                {t('party.status.kick')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={isBusy}
                onClick={onCloseDrawer}
              >
                {t('party.status.cancel')}
              </Button>
            </div>
          ) : null}

          {!canManage ? (
            <div className="mt-1.5 text-[11px] text-muted-foreground">
              {t('party.status.need-leader')}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

function MemberChip({
  member,
  isActive,
  onSelect,
}: {
  member: PartyStatusMember
  isActive: boolean
  onSelect: () => void
}) {
  const { t } = useTranslation(['stw-operations'])
  const isCaptain = member.role === 'CAPTAIN'

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border bg-[#0c0c0e] px-2 py-1 text-xs cursor-pointer',
        isActive && 'ring-2 ring-amber-400 ring-offset-1 ring-offset-background'
      )}
      onClick={onSelect}
    >
      {isCaptain ? (
        <CrownIcon className="size-3 shrink-0 text-amber-300" />
      ) : null}
      <span className="max-w-[9rem] truncate">{member.displayName}</span>
      {member.isYou ? (
        <Badge
          variant="secondary"
          className="h-4 bg-emerald-900/80 px-1.5 text-[10px] font-semibold text-emerald-300"
        >
          {t('party.status.you')}
        </Badge>
      ) : null}
    </button>
  )
}
