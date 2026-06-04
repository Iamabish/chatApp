const MessageBubbleLoader = ({ isOwnMessage = false }: { isOwnMessage?: boolean }) => {
  return (
    <div className={`flex w-full items-end gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      
      {!isOwnMessage && (
        <div className="size-9 shrink-0 rounded-full bg-zinc-800 animate-pulse" />
      )}

      <div className={`flex max-w-[75%] flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
        {!isOwnMessage && (
          <div className="mb-1 h-3 w-16 rounded bg-zinc-800 animate-pulse" />
        )}
        <div className={`h-10 rounded-2xl bg-zinc-800 animate-pulse ${
          isOwnMessage ? "w-48 rounded-br-md" : "w-40 rounded-bl-md"
        }`} />
        <div className="mt-1 h-2 w-8 rounded bg-zinc-800 animate-pulse" />
      </div>

      {isOwnMessage && (
        <div className="size-9 shrink-0 rounded-full bg-zinc-800 animate-pulse" />
      )}

    </div>
  )
}

export default MessageBubbleLoader