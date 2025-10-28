import type { ColumnDef } from '@tanstack/react-table'
import type { FriendsSummary } from '../../../types/services/friends'

import {
  BanIcon,
  CheckIcon,
  LockKeyholeIcon,
  RotateCcwIcon,
  Trash2Icon,
} from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog'

import { useFriendsTableActions } from './-hooks'

export function useFriendsColumns() {
  const { handleBlock, handleRemove } = useFriendsTableActions()

  const columns: Array<ColumnDef<FriendsSummary['friends'][number]>> = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="select row"
          />
        </div>
      ),
    },
    {
      accessorKey: 'accountId',
      accessorFn: (row) =>
        `${row.accountId}${row.displayName ?? ''}${row.alias}`,
      header: () => {
        return <div className="w-20">Name</div>
      },
      cell: ({ row }) => {
        return (
          <div className="flex flex-col py-1 w-40">
            <Button
              className="flex-wrap h-auto px-0 py-0 text-left text-foreground w-full"
              variant="link"
            >
              <span className="truncate w-40">
                {(row.original.alias.length > 0
                  ? row.original.alias
                  : row.original.displayName) ?? row.original.accountId}
              </span>
              <span className="flex text-muted-foreground text-xs">
                <span className="truncate w-40">
                  {row.original.alias.length > 0
                    ? row.original.displayName ?? row.original.accountId
                    : ''}
                </span>
              </span>
            </Button>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          {/* <Button
            className="flex h-8 py-0"
            variant="outline"
            size="sm"
          >
            Request
          </Button> */}

          <Button
            className="flex h-8 py-0"
            variant="outline"
            size="sm"
          >
            Invite
          </Button>

          <Button
            className="flex px-0 py-0 size-8 text-green-500/60 [&:not(:disabled)]:hover:text-green-500"
            variant="ghost"
            size="sm"
          >
            <LockKeyholeIcon className="size-4" />
            <span className="sr-only">Whitelist</span>
          </Button>

          <ActionDelete
            displayName={row.original.displayName}
            callback={handleRemove([row.original])}
          />

          <ActionBlock
            displayName={row.original.displayName}
            callback={handleBlock([row.original])}
          />
        </div>
      ),
    },
  ]

  return {
    columns,
  }
}

export function useIncomingColumns() {
  const { handleAdd, handleBlock, handleRemove } = useFriendsTableActions()

  const columns: Array<ColumnDef<FriendsSummary['incoming'][number]>> = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="select row"
          />
        </div>
      ),
    },
    {
      accessorKey: 'accountId',
      accessorFn: (row) => `${row.accountId}${row.displayName ?? ''}`,
      header: () => {
        return <div className="w-20">Name</div>
      },
      cell: ({ row }) => {
        return (
          <div className="flex flex-col py-1 w-40">
            <Button
              className="flex-wrap h-auto px-0 py-0 text-left text-foreground w-full"
              variant="link"
            >
              <span className="truncate w-40">
                {row.original.displayName ?? row.original.accountId}
              </span>
            </Button>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Button
            className="flex px-0 py-0 size-8 text-green-500/60 [&:not(:disabled)]:hover:text-green-500"
            variant="ghost"
            size="sm"
            onClick={handleAdd([row.original], 'incoming')}
          >
            <CheckIcon className="size-4" />
            <span className="sr-only">Accept</span>
          </Button>

          <ActionDelete
            displayName={row.original.displayName}
            callback={handleRemove([row.original], 'incoming')}
          />

          <ActionBlock
            displayName={row.original.displayName}
            callback={handleBlock([row.original], 'incoming')}
          />
        </div>
      ),
    },
  ]

  return {
    columns,
  }
}

export function useOutgoingColumns() {
  const { handleBlock, handleRemove } = useFriendsTableActions()

  const columns: Array<ColumnDef<FriendsSummary['outgoing'][number]>> = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="select row"
          />
        </div>
      ),
    },
    {
      accessorKey: 'accountId',
      accessorFn: (row) => `${row.accountId}${row.displayName ?? ''}`,
      header: () => {
        return <div className="w-20">Name</div>
      },
      cell: ({ row }) => {
        return (
          <div className="flex flex-col py-1 w-40">
            <Button
              className="flex-wrap h-auto px-0 py-0 text-left text-foreground w-full"
              variant="link"
            >
              <span className="truncate w-40">
                {row.original.displayName ?? row.original.accountId}
              </span>
            </Button>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <ActionDelete
            displayName={row.original.displayName}
            callback={handleRemove([row.original], 'outgoing')}
          />

          <ActionBlock
            displayName={row.original.displayName}
            callback={handleBlock([row.original], 'outgoing')}
          />
        </div>
      ),
    },
  ]

  return {
    columns,
  }
}

export function useBlocklistColumns() {
  const { handleUnblock } = useFriendsTableActions()

  const columns: Array<ColumnDef<FriendsSummary['blocklist'][number]>> = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="select row"
          />
        </div>
      ),
    },
    {
      accessorKey: 'accountId',
      accessorFn: (row) => `${row.accountId}${row.displayName ?? ''}`,
      header: () => {
        return <div className="w-20">Name</div>
      },
      cell: ({ row }) => {
        return (
          <div className="flex flex-col py-1 w-40">
            <Button
              className="flex-wrap h-auto px-0 py-0 text-left text-foreground w-full"
              variant="link"
            >
              <span className="truncate w-40">
                {row.original.displayName ?? row.original.accountId}
              </span>
            </Button>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="flex px-0 py-0 size-8"
                variant="ghost"
                size="sm"
              >
                <RotateCcwIcon className="size-4" />
                <span className="sr-only">Unblock</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to unblock{' '}
                  {row.original.displayName}?
                </DialogTitle>
              </DialogHeader>
              <DialogFooter className="flex-row justify-center sm:justify-center">
                <div className="flex gap-2">
                  <DialogClose asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleUnblock([row.original])}
                    >
                      Yes
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                    >
                      No
                    </Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
  ]

  return {
    columns,
  }
}

function ActionDelete({
  callback,
  displayName,
}: {
  callback: () => void
  displayName?: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="flex px-0 py-0 size-8 text-[#ff6868]/60 [&:not(:disabled)]:hover:text-[#ff6868]"
          variant="ghost"
          size="sm"
        >
          <Trash2Icon className="size-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to remove {displayName ?? 'Unknown User'}
            ?
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex-row justify-center sm:justify-center">
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button
                size="sm"
                variant="secondary"
                onClick={callback}
              >
                Yes
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                size="sm"
                variant="ghost"
              >
                No
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ActionBlock({
  callback,
  displayName,
}: {
  callback: () => void
  displayName?: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="flex px-0 py-0 size-8"
          variant="ghost"
          size="sm"
        >
          <BanIcon className="size-4" />
          <span className="sr-only">Block</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to block {displayName ?? 'Unknown User'}?
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex-row justify-center sm:justify-center">
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button
                size="sm"
                variant="secondary"
                onClick={callback}
              >
                Yes
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                size="sm"
                variant="ghost"
              >
                No
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
