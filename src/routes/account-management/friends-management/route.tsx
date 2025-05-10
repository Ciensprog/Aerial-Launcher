import { createRoute } from '@tanstack/react-router'
import {
  ColumnDef,
  // ColumnFiltersState,
  // Row,
  // SortingState,
  // VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  BanIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Trash2Icon,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { Combobox } from '../../../components/ui/extended/combobox'
import { Input } from '../../../components/ui/input'
// import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip'

import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { cn } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/account-management/friends-management',
  component: () => {
    const { t } = useTranslation(['sidebar'], {
      keyPrefix: 'account-management',
    })

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {t('options.friends-management')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['account-management', 'general'])

  const [data] = useState<Array<z.infer<typeof schema>>>(() => [
    {
      accountId: 'Andhord',
      alias: 'Anjor',
      created: '2020-01-01T02:00:00.000Z',
      favorite: false,
      groups: [],
      note: '',
    },
    {
      accountId: 'Kuva_.',
      alias: 'Copia de Kuda',
      created: '2020-01-01T02:00:00.000Z',
      favorite: false,
      groups: [],
      note: '',
    },
    {
      accountId: 'Yo Fist',
      alias: '',
      created: '2020-01-01T02:00:00.000Z',
      favorite: false,
      groups: [],
      note: '',
    },
  ])
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      // sorting,
      // columnVisibility,
      rowSelection,
      // columnFilters,
      pagination,
    },
    getRowId: (row) => row.accountId,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    // onSortingChange: setSorting,
    // onColumnFiltersChange: setColumnFilters,
    // onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  return (
    <div className="flex flex-grow">
      <div className="flex flex-col gap-5 items-center justify-center w-full">
        <div className="max-w-lg space-y-2 w-full">
          <div className="flex flex-grow gap-5">
            <Combobox
              className="max-w-full"
              emptyPlaceholder={t('form.accounts.no-options', {
                ns: 'general',
              })}
              emptyContent={t('form.accounts.search-empty', {
                ns: 'general',
              })}
              placeholder={t('form.accounts.select', {
                ns: 'general',
              })}
              placeholderSearch={t('form.accounts.placeholder', {
                ns: 'general',
                context: !getMenuOptionVisibility('showTotalAccounts')
                  ? 'private'
                  : undefined,
                // total: options.length,
                total: [].length,
              })}
              // options={options}
              options={[]}
              value={[]}
              // customFilter={customFilter}
              onChange={() => {}}
              // onSelectItem={onSelectItem}
              emptyContentClassname="py-6 text-center text-sm"
              // disabled={accountSelectorIsDisabled}
              // disabledItem={accountSelectorIsDisabled}
              // inputSearchIsDisabled={accountSelectorIsDisabled}
              hideInputSearchWhenOnlyOneOptionIsAvailable
              hideSelectorOnSelectItem
            />
            <Button
              size="sm"
              variant="default"
            >
              Get Friend List
            </Button>
          </div>
        </div>

        <div className="max-w-lg w-full">
          <Tabs
            className={cn(
              'mb-5- mt-4- max-w-lg mx-auto-',
              '[&_.tab-content]:mt-6',

              '[&_.tab-content]:hidden'
            )}
            defaultValue={'friends'}
          >
            <div
              className="flex items-center"
              id="alert-navigation-container"
            >
              <TabsList>
                <TabsTrigger value={'friends'}>Friends</TabsTrigger>
                <TabsTrigger value={'incoming'}>Incoming</TabsTrigger>
                <TabsTrigger value={'outgoing'}>Outgoing</TabsTrigger>
                <TabsTrigger value={'blocklist'}>Blocklist</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              className="tab-content"
              value={'friends'}
            >
              Content
            </TabsContent>
            <TabsContent
              className="tab-content"
              value={'incoming'}
            >
              Content
            </TabsContent>
            <TabsContent
              className="tab-content"
              value={'outgoing'}
            >
              Content
            </TabsContent>
            <TabsContent
              className="tab-content"
              value={'blocklist'}
            >
              Content
            </TabsContent>
          </Tabs>
        </div>

        <div className="max-w-lg pt-1- w-full">
          <div className="leading-none mb-5- text-center uppercase">
            Total friends
            <div className="flex font-bold gap-1 items-center justify-center text-4xl">
              {numberWithCommaSeparator(1234)}
            </div>
          </div>
        </div>

        <div className="flex gap-3 items-center mb-5- max-w-lg w-full">
          <Input
            placeholder="Search this list"
            // value={searchValue}
            // onChange={onChangeSearchValue}
          />
        </div>

        <div className="border max-w-lg rounded w-full">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted rounded-t">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  className={cn(
                    '[&>th:first-child]:w-10',
                    '[&>th:nth-child(2)]:w-44'
                  )}
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        className="h-8 p-0"
                        colSpan={header.colSpan}
                        key={header.id}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="">
              {table.getRowModel().rows.map((row, index) => (
                <TableRow
                  data-state={row.getIsSelected() && 'selected'}
                  className="h-11 relative z-0"
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className={cn(`cell-${index}`, 'p-0')}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4">
          {/* <div className="flex flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div> */}
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="flex gap-2 items-center">
              {/* <Label
                htmlFor="rows-per-page"
                className="text-sm font-medium"
              >
                Rows per page
              </Label> */}
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger
                  className="h-8 w-20"
                  id="rows-per-page"
                >
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                    <SelectItem
                      key={pageSize}
                      value={`${pageSize}`}
                    >
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() =>
                  table.setPageIndex(table.getPageCount() - 1)
                }
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const schema = z.object({
  accountId: z.string(),
  groups: z.array(z.any()),
  alias: z.string(),
  note: z.string(),
  favorite: z.boolean(),
  created: z.string(),
})

const columns: Array<ColumnDef<z.infer<typeof schema>>> = [
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
    accessorKey: 'header',
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
              {row.original.alias.length > 0
                ? row.original.alias
                : row.original.accountId}
            </span>
            <span className="flex text-muted-foreground text-xs">
              <span className="truncate w-40">
                {row.original.alias.length > 0
                  ? row.original.accountId
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
    cell: () => (
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

        <TooltipProvider
          delayDuration={0}
          disableHoverableContent
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="flex px-0 py-0 size-8"
                variant="ghost"
                size="sm"
              >
                <BanIcon className="size-4" />
                <span className="sr-only">Block</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-foreground text-muted font-medium"
              side="left"
            >
              <p>Block</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider
          delayDuration={0}
          disableHoverableContent
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="flex px-0 py-0 size-8 text-[#ff6868]/60 [&:not(:disabled)]:hover:text-[#ff6868]"
                variant="ghost"
                size="sm"
              >
                <Trash2Icon className="size-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-foreground text-muted font-medium"
              side="left"
            >
              <p>Remove</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
  },
]
