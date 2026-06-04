import { Hash } from "lucide-react"

interface EmptyRoomChatProps {
  roomName?: string
}
const EmptyRoomChat = ({
  roomName,
}: EmptyRoomChatProps) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950">
        <Hash className="h-8 w-8 text-zinc-500" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-100">
        Welcome to {roomName || "the room"}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
        No messages yet. Be the first member to start the conversation.
      </p>
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
        <p className="text-xs text-zinc-600">
          Your message could start the next great discussion.
        </p>
      </div>

    </div>
  )
}

export default EmptyRoomChat