import { useState } from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react"

import useMessage from "@/hooks/useMessaage"

interface ChatProps {
  id: string
  isOwnMessage: boolean
  avatar?: string | null
  createdAt?: string
  userName?: string
  text: string
  data?: string | null
  receiverId?: string
  roomId?: string
  onEdit: (
    id: string,
    text: string
  ) => void
}

const MessageBubble = ({
  id,
  isOwnMessage,
  avatar,
  createdAt,
  userName,
  text,
  data,
  receiverId,
  roomId,
  onEdit,
}: ChatProps) => {

  const [open, setOpen] =
    useState(false)

  const {
    deleteMessageMutation,
  } = useMessage(
    receiverId || roomId || ""
  )

  function handleDelete(
    id: string,
    flag: "me" | "everyone"
  ) {

    if (roomId) {
      console.log(
        "delete room message"
      )

      return
    }

    deleteMessageMutation.mutate({
      id,
      flag,
    })
  }

  return (
    <div
      className={`group flex w-full items-end gap-2 ${
        isOwnMessage
          ? "justify-end"
          : "justify-start"
      }`}
    >

      {!isOwnMessage && (
        <Avatar className="size-9 shrink-0 border border-zinc-800">

          <AvatarImage
            src={avatar || ""}
            alt={userName}
          />

          <AvatarFallback className="bg-zinc-900 text-xs text-zinc-200">
            {userName
              ?.slice(0, 2)
              .toUpperCase() || "U"}
          </AvatarFallback>

        </Avatar>
      )}

      {isOwnMessage && (
        <DropdownMenu
          open={open}
          onOpenChange={setOpen}
        >

          <DropdownMenuTrigger asChild>

            <button className="opacity-0 transition-opacity group-hover:opacity-100">
              <MoreVertical className="size-4 text-zinc-500 hover:text-white" />
            </button>

          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48 border-zinc-800 bg-zinc-950 text-zinc-100"
          >

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                onEdit(id, text)
                setOpen(false)
              }}
            >
              <Pencil className="mr-2 size-4" />
              Edit Message
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-zinc-800" />

            <DropdownMenuSub>

              <DropdownMenuSubTrigger className="cursor-pointer">

                <Trash2 className="mr-2 size-4 text-red-500" />

                Delete Message

              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent className="border-zinc-800 bg-zinc-950 text-zinc-100">

                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    handleDelete(
                      id,
                      "me"
                    )

                    setOpen(false)
                  }}
                >
                  Delete For Me
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={() => {
                    handleDelete(
                      id,
                      "everyone"
                    )

                    setOpen(false)
                  }}
                >
                  Delete For Everyone
                </DropdownMenuItem>

              </DropdownMenuSubContent>

            </DropdownMenuSub>

          </DropdownMenuContent>

        </DropdownMenu>
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
          className={`rounded-2xl px-3 py-3 ${
            isOwnMessage
              ? "rounded-br-md bg-white text-black"
              : "rounded-bl-md border border-zinc-800 bg-zinc-900 text-zinc-100"
          }`}
        >

          {data && (
            <img
              src={data}
              alt="attachment"
              className="mb-2 max-h-72 max-w-72 rounded-xl object-cover"
            />
          )}

          {text && (
            <p className="break-words text-sm leading-relaxed">
              {text}
            </p>
          )}

        </div>

        <span className="mt-1 px-1 text-[11px] text-zinc-500">

          {createdAt
            ? new Date(
                createdAt
              ).toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute:
                    "2-digit",
                }
              )
            : ""}

        </span>
      </div>

      {isOwnMessage && (
        <Avatar className="size-9 shrink-0 border border-zinc-800">

          <AvatarImage
            src={avatar || ""}
            alt={userName}
          />

          <AvatarFallback className="bg-zinc-900 text-xs text-zinc-200">
            {userName
              ?.slice(0, 2)
              .toUpperCase() || "U"}
          </AvatarFallback>

        </Avatar>
      )}

    </div>
  )
}

export default MessageBubble