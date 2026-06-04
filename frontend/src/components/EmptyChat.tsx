import { MessageCircle } from "lucide-react"
interface EmptyChatProps {
  userName?: string
}
const EmptyChat = ({
  userName,
}: EmptyChatProps) => {

  console.log('empty chat rendering ');
  

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950">
        <MessageCircle className="h-8 w-8 text-zinc-500" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-100">
        No messages yet
      </h3>
      <p className="mt-2 max-w-xs text-sm text-zinc-500">
        Start a conversation with{" "}
        <span className="text-zinc-300">
          {userName || "this user"}
        </span>
        .
      </p>
    </div>
  )
}

export default EmptyChat