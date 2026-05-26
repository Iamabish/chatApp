const EmptyChat = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      
      <div className="flex max-w-md flex-col items-center text-center">

        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900">
          
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12c0 4.97-4.03 9-9 9a8.96 8.96 0 01-4.255-1.067L3 21l1.067-4.745A8.96 8.96 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9z"
            />
          </svg>

        </div>

        <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
          Your messages
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Select a conversation from the sidebar and start chatting.
        </p>

      </div>

    </div>
  )
}

export default EmptyChat