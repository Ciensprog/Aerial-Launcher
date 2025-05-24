import type { FriendsSummary } from '../../../../types/services/friends'

import {
  CustomSearch,
  CustomTable,
  CustomTablePagination,
  useTableConfig,
} from '../../../../components/ui/extended/form/table'

import { useBlocklistColumns } from '../-columns'

import { numberWithCommaSeparator } from '../../../../lib/parsers/numbers'

export function BlocklistSection({
  data,
}: {
  data: FriendsSummary['blocklist']
}) {
  const { columns } = useBlocklistColumns()

  const { perPageList, table } = useTableConfig({
    columns,
    data,
    rowId: 'accountId',
  })

  return (
    <div className="space-y-5">
      <div className="leading-none text-center uppercase">
        Total Blocklist
        <div className="flex font-bold gap-1 items-center justify-center text-4xl">
          {numberWithCommaSeparator(data.length)}
        </div>
      </div>

      <div className="flex gap-3 items-center max-w-lg w-full">
        <CustomSearch
          table={table}
          isDisabled={data.length <= 0}
        />
      </div>

      <div className="border max-w-lg rounded w-full">
        <CustomTable table={table} />
      </div>

      <CustomTablePagination
        table={table}
        perPageList={perPageList}
      />
    </div>
  )
}
