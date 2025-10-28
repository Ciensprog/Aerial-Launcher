import type { FriendsSummary } from '../../../../types/services/friends'

import {
  CustomSearch,
  CustomTable,
  CustomTablePagination,
  useTableConfig,
} from '../../../../components/ui/extended/form/table'

import { useFriendsColumns } from '../-columns'

import { useFnnyHandleActions } from '../../../information/credits/-hooks'
import { useFriendsManagement } from '../../../../hooks/management/friends'

import { numberWithCommaSeparator } from '../../../../lib/parsers/numbers'

export function FriendsSection({
  data,
}: {
  data: FriendsSummary['friends']
}) {
  const { columns } = useFriendsColumns()
  const { selected } = useFriendsManagement()
  const { handleMnomoeAttrs } = useFnnyHandleActions()

  const { perPageList, table } = useTableConfig({
    columns,
    data,
    rowId: 'accountId',
  })

  return (
    <div className="space-y-5">
      <div className="leading-none text-center uppercase">
        Total Friends
        <div
          className="flex font-bold gap-1 items-center justify-center text-4xl"
          {...(selected && data.length <= 0 ? handleMnomoeAttrs : {})}
        >
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
