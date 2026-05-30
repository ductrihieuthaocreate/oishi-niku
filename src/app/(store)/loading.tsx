export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-6 pb-16">
      {/* Carousel skeleton */}
      <div className="w-full h-16 rounded-2xl bg-muted animate-pulse mb-4" />

      <div className="flex gap-6">
        {/* Sidebar skeleton */}
        <div className="hidden md:block w-52 shrink-0">
          <div className="bg-muted/50 rounded-3xl p-4 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="flex-1 min-w-0">
          <div className="h-12 rounded-2xl bg-muted animate-pulse mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden" style={{ background: 'oklch(0.99 0.004 80)' }}>
                <div className="p-2 pb-0">
                  <div className="aspect-square rounded-2xl bg-muted animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
                  <div className="h-4 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-5 w-1/2 rounded bg-muted animate-pulse mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best sellers skeleton */}
        <div className="hidden lg:block w-52 shrink-0">
          <div className="bg-muted/50 rounded-3xl p-4 space-y-3">
            <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-muted animate-pulse flex-shrink-0" />
                <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
