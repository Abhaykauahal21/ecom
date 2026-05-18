import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Premium Header Skeleton */}
      <section className="relative pt-12 md:pt-20 pb-8 md:pb-16 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center space-y-4">
          <Skeleton className="h-6 w-32 mx-auto rounded-full" />
          <Skeleton className="h-12 md:h-16 w-48 md:w-64 mx-auto rounded-2xl" />
          <Skeleton className="h-4 w-64 md:w-96 mx-auto rounded-full" />
        </div>
      </section>

      <div className="container mx-auto px-6 pb-24">
        {/* Mobile Search Skeleton */}
        <div className="md:hidden space-y-6 mb-8">
            <Skeleton className="h-14 w-full rounded-[2rem]" />
            <div className="flex gap-2 overflow-x-auto pb-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-full" />
                ))}
            </div>
        </div>

        {/* Toolbar Skeleton */}
        <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-xl border border-white/5 rounded-[2rem] md:rounded-3xl p-3 md:p-4 mb-8 md:mb-12 flex flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="hidden md:block h-12 w-80 rounded-2xl" />
            <Skeleton className="h-4 w-16 rounded-full mx-2" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 md:h-12 w-32 md:w-40 rounded-2xl" />
            <Skeleton className="hidden sm:block h-12 w-24 rounded-2xl" />
          </div>
        </div>

        <div className="flex gap-12">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-4 w-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full rounded-lg" />
                  <Skeleton className="h-6 w-4/5 rounded-lg" />
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                </div>
              </div>
            ))}
          </aside>

          {/* Grid Skeleton - 2 Column Mobile */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-[2.5rem] border border-white/5 overflow-hidden h-[280px] md:h-[500px] flex flex-col">
                <Skeleton className="flex-1 rounded-none" />
                <div className="p-4 md:p-6 space-y-2 md:space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-2 md:h-3 w-12 md:w-16 rounded-full" />
                    <Skeleton className="h-2 md:h-3 w-8 md:w-10 rounded-full" />
                  </div>
                  <Skeleton className="h-4 md:h-6 w-full rounded-lg" />
                  <Skeleton className="h-4 md:h-8 w-16 md:w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
