/**
 * Loading skeleton components for better UX during data fetching
 * Includes shimmer effect and dark mode support
 */

// Skeleton loaders - dark mode classes removed
export function DoctorCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-full bg-slate-200"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

export function SlotCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded w-20"></div>
        <div className="h-8 bg-slate-200 rounded w-24"></div>
        <div className="h-4 bg-slate-200 rounded w-32"></div>
        <div className="h-10 bg-slate-200 rounded mt-4"></div>
      </div>
    </div>
  )
}

export function DoctorListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <DoctorCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function SlotListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <SlotCardSkeleton key={i} />
      ))}
    </div>
  )
}

