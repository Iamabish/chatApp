const MemberLoader = () => {
  return (
    <div className="flex items-center gap-3 rounded-xl p-2">
      
      <div className="relative">
        <div className="size-10 rounded-full bg-zinc-800 animate-pulse" />

        <div className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-zinc-950 bg-zinc-700 animate-pulse" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-24 rounded bg-zinc-800 animate-pulse" />

          <div className="h-5 w-12 rounded-md bg-zinc-800 animate-pulse" />
        </div>

        <div className="h-3 w-14 rounded bg-zinc-800 animate-pulse" />
      </div>

      <div className="size-8 rounded-lg bg-zinc-800 animate-pulse" />
    </div>
  )
}

export default MemberLoader