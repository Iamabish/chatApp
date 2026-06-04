import { Separator } from "@/components/ui/separator"

const RoomInfoLoader = () => {
  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-black text-white">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-black/80 px-6 py-4 backdrop-blur">
        <div className="h-4 w-20 rounded bg-zinc-800 animate-pulse" />
        <div className="h-8 w-16 rounded-lg bg-zinc-800 animate-pulse" />
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-10">
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-zinc-800 animate-pulse" />

          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-40 rounded bg-zinc-800 animate-pulse" />
            <div className="h-4 w-24 rounded bg-zinc-800 animate-pulse" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <div className="mb-4 h-3 w-20 rounded bg-zinc-800 animate-pulse" />

          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-zinc-800 animate-pulse" />
            <div className="h-4 w-4/5 rounded bg-zinc-800 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-zinc-800 animate-pulse" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="px-5 pt-4 pb-2">
            <div className="h-3 w-20 rounded bg-zinc-800 animate-pulse" />
          </div>

          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-zinc-800 animate-pulse" />
              <div className="h-4 w-16 rounded bg-zinc-800 animate-pulse" />
            </div>

            <div className="h-4 w-8 rounded bg-zinc-800 animate-pulse" />
          </div>

          <Separator className="bg-zinc-800" />

          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-zinc-800 animate-pulse" />
              <div className="h-4 w-16 rounded bg-zinc-800 animate-pulse" />
            </div>

            <div className="h-4 w-24 rounded bg-zinc-800 animate-pulse" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <div className="mb-4 h-3 w-16 rounded bg-zinc-800 animate-pulse" />

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-800 animate-pulse" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 rounded bg-zinc-800 animate-pulse" />
              <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
            </div>

            <div className="h-4 w-4 rounded bg-zinc-800 animate-pulse" />
          </div>
        </div>

        <div className="h-10 w-full rounded-2xl bg-zinc-800 animate-pulse" />
      </div>
    </div>
  )
}

export default RoomInfoLoader