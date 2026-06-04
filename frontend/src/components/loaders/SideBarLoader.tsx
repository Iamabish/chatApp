import { Skeleton } from "@/components/ui/skeleton"

const SidebarLoader = () => {
  return (
    <div className="flex h-screen w-[420px] flex-col border-r border-zinc-900 bg-black">
      <div className="shrink-0 border-b border-zinc-900">
        <div className="px-5 pt-4">
          <Skeleton className="h-6 w-24 bg-zinc-900" />
          <Skeleton className="mt-2 h-4 w-16 bg-zinc-900" />
        </div>
        <div className="flex gap-2 p-4">
          <Skeleton className="h-10 flex-1 rounded-md bg-zinc-900" />
          <Skeleton className="h-10 flex-1 rounded-md bg-zinc-900" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-2xl px-3 py-3"
            >
              <Skeleton className="h-12 w-12 rounded-full bg-zinc-900" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-28 bg-zinc-900" />
                <Skeleton className="h-3 w-14 bg-zinc-900" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="shrink-0 border-t border-zinc-900 p-3">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-3">
          <Skeleton className="h-11 w-11 rounded-full bg-zinc-900" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-28 bg-zinc-900" />
            <Skeleton className="h-3 w-20 bg-zinc-900" />
          </div>
          <Skeleton className="h-4 w-4 rounded bg-zinc-900" />
        </div>
      </div>
    </div>
  )
}
export default SidebarLoader