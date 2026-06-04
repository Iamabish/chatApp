import { MessageCircle } from "lucide-react"

const NoChat = () => {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center bg-black px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-black">
        <MessageCircle className="h-8 w-8 text-zinc-500" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-zinc-100">
        No messages yet
      </h2>
      <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
        Start the conversation by sending the first message.
      </p>
    </div>
  )
}

export default NoChat