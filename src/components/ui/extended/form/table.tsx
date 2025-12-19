import type {
  ColumnDef,
  Table as TableDefinition,
} from '@tanstack/react-table'

import {
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
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../button'
import { Input } from '../../input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../table'

import { cn } from '../../../../lib/utils'

const defaultPerPageList = [10, 20, 30, 40, 50, 100]

export function useTableConfig<Data extends Record<string, unknown>>({
  columns,
  data,
  perPageList = defaultPerPageList,
  rowId,

  defaultPageSize = 50,
}: {
  columns: Array<ColumnDef<Data>>
  data: Array<Data>
  perPageList?: Array<number>
  rowId: keyof Data

  defaultPageSize?: number
}) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })

  const table = useReactTable({
    data,
    columns,
    enableRowSelection: true,
    globalFilterFn: 'includesString',
    state: {
      // columnFilters,
      // columnVisibility,
      globalFilter,
      pagination,
      rowSelection,
      // sorting,
    },

    getRowId: (row) => row[rowId] as string,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),

    // onColumnFiltersChange: setColumnFilters,
    // onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    // onSortingChange: setSorting,
  })

  return {
    table,
    perPageList,
  }
}

export function CustomTable<Data extends Record<string, unknown>>({
  table,
}: {
  table: TableDefinition<Data>
}) {
  return (
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
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, index) => (
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
          ))
        ) : (
          <TableRow data-empty>
            <TableCell
              colSpan={table.getVisibleLeafColumns().length}
              className="h-24 text-center"
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export function CustomSearch<Data extends Record<string, unknown>>({
  isDisabled,
  table,
}: {
  isDisabled?: boolean
  table: TableDefinition<Data>
}) {
  return (
    <Input
      placeholder="Search this list"
      onChange={(event) =>
        table.setGlobalFilter(String(event.target.value).trim())
      }
      disabled={isDisabled}
    />
  )
}

export function CustomTablePagination<
  Data extends Record<string, unknown>,
>({
  perPageList = defaultPerPageList,
  table,
}: {
  perPageList?: Array<number>
  table: TableDefinition<Data>
}) {
  if (table.getPageCount() <= 0) {
    return null
  }

  return (
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
              {perPageList.map((pageSize) => (
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
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
