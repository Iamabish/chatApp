import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

interface ChatProps {
  isOwnMessage: boolean
  avatar?: string | null
  createdAt?: string
  userName?: string
  text: string
}

const MessageBubble = ({
  isOwnMessage,
  avatar,
  createdAt,
  userName,
  text,
}: ChatProps) => {

  return (
    <div
      className={`flex w-full items-end gap-2 ${
        isOwnMessage
          ? "justify-end"
          : "justify-start"
      }`}
    >

      {!isOwnMessage && (
        <Avatar className="h-9 w-9 shrink-0 border border-zinc-800">

          <AvatarImage
            src={avatar || ""}
            alt={userName}
          />

          <AvatarFallback className="bg-zinc-900 text-xs text-zinc-200">
            {userName?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>

        </Avatar>
      )}

      <div
        className={`flex max-w-[75%] flex-col ${
          isOwnMessage
            ? "items-end"
            : "items-start"
        }`}
      >

        {!isOwnMessage && (
          <span className="mb-1 px-1 text-xs font-medium text-zinc-500">
            {userName}
          </span>
        )}

        <div
          className={`rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ${
            isOwnMessage
              ? "rounded-br-md bg-white text-black"
              : "rounded-bl-md border border-zinc-800 bg-zinc-900 text-zinc-100"
          }`}
        >
          <p className="break-words text-sm leading-relaxed">
            {text}
          </p>
        </div>

        <span className="mt-1 px-1 text-[11px] text-zinc-500">
          {createdAt
            ? new Date(createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </span>

      </div>

      {isOwnMessage && (
        <Avatar className="h-9 w-9 shrink-0 border border-zinc-800">

          <AvatarImage
            src={avatar || ""}
            alt={userName}
          />

          <AvatarFallback className="bg-zinc-900 text-xs text-zinc-200">
            {userName?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>

        </Avatar>
      )}

    </div>
  )
}

export default MessageBubble