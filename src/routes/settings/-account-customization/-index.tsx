import type { PropsWithChildren } from 'react'

import { DndContext } from '@dnd-kit/core'
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { GripVertical } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { AccountItem } from './-item'

import { useRegisterAccounts } from '../../../hooks/accounts'
import { useGetTags } from '../../../hooks/tags'
import { useAccounts, useActions, useOrdering } from './-hooks'

import { cn, tagsArrayToSelectOptions } from '../../../lib/utils'

export function AccountCustomization() {
  const { tagsArray } = useGetTags()
  const { accounts, accountsArray, onChangeSearchValue, searchValue } =
    useAccounts()
  const { isPendingSubmitCustomDisplayName, onSubmitCustomDisplayName } =
    useActions()
  const tags = tagsArrayToSelectOptions(tagsArray)

  const { idsList, reorderAccounts } = useRegisterAccounts()

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardDescription>
          Sometimes you could need a specific display name for identifying
          an account. If you want, you can change the current display name
          with a custom name.
        </CardDescription>
        <CardDescription className="text-muted-foreground/60">
          Note: this only applies visually to the launcher accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6">
        {accountsArray.length > 1 && (
          <div className="mb-5">
            <Input
              className="pr-20"
              placeholder={`Search on ${accountsArray.length} accounts...`}
              value={searchValue}
              onChange={onChangeSearchValue}
            />
          </div>
        )}
        {accounts.length > 0 ? (
          <DndContext
            modifiers={[restrictToFirstScrollableAncestor]}
            onDragEnd={reorderAccounts}
          >
            <SortableContext
              items={idsList}
              strategy={verticalListSortingStrategy}
            >
              {accounts.map((account) => {
                return (
                  <SortableItem
                    id={account.accountId}
                    key={account.accountId}
                  >
                    <AccountItem
                      tags={tags}
                      account={account}
                      isPendingSubmitCustomDisplayName={
                        isPendingSubmitCustomDisplayName
                      }
                      onSubmitCustomDisplayName={onSubmitCustomDisplayName}
                    />
                  </SortableItem>
                )
              })}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center text-muted-foreground">
            No account found
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SortableItem({
  children,
  className,
  id,
}: PropsWithChildren<{ className?: string; id: string }>) {
  const { attributes, data, listeners, setNodeRef, style } = useOrdering({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-background flex gap-1 items-center outline-muted-foreground/20 rounded',
        data?.className,
        className
      )}
      style={style}
      {...attributes}
    >
      <div
        className={cn(
          'bg-muted-foreground/5 cursor-grab flex flex-shrink-0 h-full items-center px-2 rounded',
          data?.handleClassName
        )}
        {...listeners}
      >
        <div>
          <GripVertical />
        </div>
      </div>
      {children}
    </div>
  )
}
