import { Skeleton } from "@/components/ui/skeleton"

export const SkeletonField = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-10 w-full" />
  </div>
)

export const SkeletonFormGrid = ({ fields = 4 }: { fields?: number }) => (
  <div className="grid grid-cols-2 gap-4">
    {Array.from({ length: fields }).map((_, i) => (
      <SkeletonField key={i} />
    ))}
  </div>
)

export const SkeletonCustomFields = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-32" />
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonField key={i} />
      ))}
    </div>
  </div>
)