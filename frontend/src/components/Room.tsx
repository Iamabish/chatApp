import {
  MoreVertical,
  SendHorizonal,
  Users,
  Hash,
  Phone,
  Video,
  Paperclip,
  X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSocketStore } from "@/store/socket/useSocket"
import { useSession } from "@/lib/auth.client"
import useRoom from "@/hooks/useRoom"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router"
import { getRoomMessage, roomMember } from "@/api/room"
import MessageBubble from "./MessageBubble"

const Room = () => {
  const [message, setMessage] = useState("")
  const [editingMessage, setEditingMessage] = useState<any>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [uploadedFileUrl, setUploadedFileUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)


  const { id } = useParams()
  const { data: userData } = useSession()
  const userId = userData?.user?.id
  const { sendRoomMessageMutation, editRoomMessageMutation, leaveRoomMutation} = useRoom(id)

  const navigate = useNavigate()

 
  const { data } = useQuery({
    queryKey: ["room", id],
    queryFn: () => roomMember(id as string),
    enabled: !!id,
  })
  const {
    data: chats,
  } = useInfiniteQuery({
    queryKey: ["roomChats", id],
    queryFn: ({ pageParam = 1 }) =>
      getRoomMessage(id as string, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data.currPage
      const totalPages = lastPage.data.total_pages
      return currentPage < totalPages
        ? currentPage + 1
        : undefined
    },
    staleTime: 0
  })

  const chatData =
    chats?.pages
      ?.flatMap((page) => page.data.data)
      .reverse() || []

  const room = data?.data
  
  const members = room?.member || []
  const { onlineInRoom } = useSocketStore()


  function handleLeave() {
    leaveRoomMutation.mutate({id : id},
      {
        onSuccess : () => {
          navigate('/')
        }
      }
    )
    

  }

  async function handleUploadFile(file: File) {

    try {

      setUploading(true)

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      )

      const fakeUrl = URL.createObjectURL(file)

      setUploadedFileUrl(fakeUrl)

    } finally {

      setUploading(false)

    }
  }

    function handleSubmit() {

      if (!message.trim() && !uploadedFileUrl) return

        if (editingMessage) {
          editRoomMessageMutation.mutate({
            id: id as string,

            payload: {
              messageId: editingMessage.id,
              text: message,
              data: uploadedFileUrl,
            },
          })

          setEditingMessage(null)

        } else {

          sendRoomMessageMutation.mutate({
            id: id as string,

            payload: {
              text: message,
              data: uploadedFileUrl,
            },
          })
        }

        setMessage("")
        setUploadedFileUrl("")
        setImagePreview("")

        if (fileRef.current) {
          fileRef.current.value = ""
        }
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white">

      <div className="hidden w-[300px] border-r border-zinc-900 md:flex flex-col">

        <div className="border-b border-zinc-900 p-4">

          <div className="flex items-center gap-3">

            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900">
              <Hash className="size-5 text-zinc-400" />
            </div>

            <div className="min-w-0">

              <h2 className="truncate font-semibold">
                {room?.slug}
              </h2>

              <p className="truncate text-sm text-zinc-500">
                {room?.description}
              </p>

            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3">

          <div className="flex items-center gap-2 text-sm text-zinc-400">

            <Users className="size-4" />

            Members

          </div>

          <span className="text-xs text-zinc-500">
            {members.length}
          </span>

        </div>

        <div className="flex-1 overflow-y-auto p-2">

          {members.map((member: any) => {

            const isOnline =
              !!onlineInRoom[room?.id]?.has(member.id)

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-zinc-900"
              >

                <div className="relative">

                  <Avatar className="size-10">

                    <AvatarImage
                      src={member.avatarUrl || ""}
                    />

                    <AvatarFallback className="bg-zinc-800 text-sm">
                      {member.userName?.[0]}
                    </AvatarFallback>

                  </Avatar>

                  {isOnline && (
                    <div className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-zinc-950 bg-emerald-500" />
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-medium">
                    {member.userName}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {isOnline ? "online" : "offline"}
                  </p>

                </div>

              </div>
            )
          })}


        </div>
      </div>

      <div className="flex flex-1 flex-col">

        <div className="flex h-16 items-center justify-between border-b border-zinc-900 px-4">

          <div className="flex items-center gap-3">

            <Avatar className="size-10">

              <AvatarImage
                src={room?.avatarUrl || ""}
              />

              <AvatarFallback className="bg-zinc-900">
                #
              </AvatarFallback>

            </Avatar>

            <div>

              <h2 className="font-semibold">
                {room?.slug}
              </h2>

              <p className="text-xs text-zinc-500">
                {members.length} members
              </p>

            </div>
          </div>

          <div className="flex items-center gap-1">

            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl hover:bg-zinc-900"
            >
              <Phone className="size-5" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl hover:bg-zinc-900"
            >
              <Video className="size-5" />
            </Button>

            <DropdownMenu>

              <DropdownMenuTrigger asChild>

                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-xl hover:bg-zinc-900"
                >
                  <MoreVertical className="size-5" />
                </Button>

              </DropdownMenuTrigger>

              <DropdownMenuContent className="border-zinc-800 bg-zinc-950 text-white">

                <DropdownMenuItem>
                  Room Info
                </DropdownMenuItem>

                <DropdownMenuItem>
                  Invite Members
                </DropdownMenuItem>

                <DropdownMenuItem className="text-red-500" onClick={handleLeave}>
                  Leave Room
                </DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">

          {chatData?.map((msg: any) => (

            <MessageBubble
              key={msg.id}
              id={msg.id}
              text={msg.text}
              data={msg.data}
              createdAt={msg.createdAt}
              userName={msg.sender?.userName}
              avatar={msg.sender?.avatarUrl}
              receiverId={id as string}
              roomId={id as string}
              isOwnMessage={
                msg.senderId === userId
              }
              onEdit={(id, text) => {
                setEditingMessage(msg)
                setMessage(text)
              }}
              slug={room?.slug}
            />
          ))}

        </div>

        <div className="border-t border-zinc-900 p-4">

          {editingMessage && (

            <div className="mb-2 flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-2 text-xs text-zinc-400">

              <span>
                Editing message
              </span>

              <button
                onClick={() => {
                  setEditingMessage(null)
                  setMessage("")
                }}
              >
                Cancel
              </button>

            </div>
          )}

          {imagePreview && (

            <div className="mx-auto mb-2 flex max-w-4xl justify-start">

              <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-1.5">

                <img
                  src={imagePreview}
                  alt="preview"
                  className="h-20 w-20 rounded-lg object-cover"
                />

                <button
                  onClick={() => {

                    setImagePreview("")
                    setUploadedFileUrl("")

                    if (fileRef.current) {
                      fileRef.current.value = ""
                    }
                  }}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-black"
                >
                  <X className="h-3 w-3" />
                </button>

              </div>

            </div>
          )}

          <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 shadow-lg">

            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <input
              type="file"
              hidden
              ref={fileRef}
              accept="image/*"
              onChange={(e) => {

                const file = e.target.files?.[0]

                if (file) {

                  setImagePreview(
                    URL.createObjectURL(file)
                  )

                  handleUploadFile(file)
                }
              }}
            />

            <Input
              placeholder={
                uploading
                  ? "Uploading image..."
                  : "Type a message..."
              }
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              className="border-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <Button
              onClick={handleSubmit}
              size="icon"
              disabled={uploading}
              className="shrink-0 rounded-xl bg-white text-black hover:bg-zinc-200"
            >
              <SendHorizonal className="size-5" />
            </Button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Room