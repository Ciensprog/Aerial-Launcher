import { Skeleton } from '../../../components/ui/skeleton'

const defaultTotal = 3

export function LoadingMissions({
  section,
  showTitle,
  total = defaultTotal,
}: {
  section?: boolean
  showTitle?: boolean
  total?: number
}) {
  if (!section) {
    return (
      <div className="flex flex-col gap-0.5">
        <MissionSkeleton total={total} />
      </div>
    )
  }

  return (
    <div className="">
      {showTitle && <Skeleton className="h-7 mb-2 w-32" />}
      <div className="flex flex-col gap-0.5">
        <MissionSkeleton total={total} />
      </div>
    </div>
  )
}

function MissionSkeleton({ total = defaultTotal }: { total?: number }) {
  return Array.from({ length: total > 0 ? total : defaultTotal }).map(
    (_, index) => (
      <Skeleton
        className="h-8 w-full"
        key={index}
      />
    )
  )
}
