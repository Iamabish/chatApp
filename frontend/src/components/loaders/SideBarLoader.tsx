import { Skeleton } from "@/components/ui/skeleton"

const SidebarLoader = () => {
  return (
    <div className="flex h-screen w-[420px] flex-col border-r border-zinc-900 bg-black">
      <div className="border-b border-zinc-900 px-5 py-4">
        <Skeleton className="h-6 w-28 bg-zinc-900" />
        <Skeleton className="mt-2 h-4 w-20 bg-zinc-900" />
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-2xl border border-zinc-900 bg-zinc-950/40 px-3 py-3"
          >
            <Skeleton className="h-12 w-12 rounded-full bg-zinc-900" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-28 bg-zinc-900" />
              <Skeleton className="h-3 w-16 bg-zinc-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SidebarLoader