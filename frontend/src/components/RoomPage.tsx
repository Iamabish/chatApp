import {
  MoreVertical,
  SendHorizonal,
  Users,
  Hash,
  Phone,
  Video,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
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
import { useParams } from "react-router"
import {  getRoomMessage, roomMember } from "@/api/room"
import MessageBubble from "./MessageBubble"

type Message = {
  id: string
  text: string
  sender: {
    id: string
    name: string
    image?: string
  }
  createdAt: string
  isCurrentUser?: boolean
}

const dummyMessages: Message[] = [
  {
    id: "1",
    text: "Welcome everyone 👋",
    sender: {
      id: "1",
      name: "Abish",
    },
    createdAt: "10:21 PM",
  },
]

const RoomPage = () => {

  const [message, setMessage] = useState("")

  const { id } = useParams()

  const { data: userData } = useSession()

  const userId = userData?.user.id

  const { joinRoomMutation, sendRoomMessageMutation  } = useRoom(id)

  useEffect(() => {

    if (!id || !userId) return

    joinRoomMutation.mutate(id)

  }, [id, userId])

  const { data } = useQuery({
    queryKey: ["room", id],
    queryFn: () => roomMember(id as string),
    enabled: !!id,
  })


  console.log('room data', data);
  


    const {
        data : chats,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        } = useInfiniteQuery({

        queryKey: ["roomChats", id],

        queryFn: ({ pageParam = 1 }) =>
            getRoomMessage(
            id as string,
            pageParam
            ),

        initialPageParam: 1,

        getNextPageParam: (lastPage) => {

            const currentPage = lastPage.data.currPage

            const totalPages = lastPage.data.total_pages

            return currentPage < totalPages
            ? currentPage + 1
            : undefined
        },
        staleTime : 0
    })



    console.log('chts data', chats);
    


    const chatData = chats?.pages?.flatMap((page) => page.data.data).reverse() || []

    console.log('chat data', chatData);
    
    


  const room = data?.data
  const members = room?.member || []
  const { onlineInRoom } = useSocketStore()

  const onlineUsers = useMemo(() => {
    if (!id) return new Set<string>()
    return onlineInRoom[id] || new Set<string>()
  }, [onlineInRoom, id])



  function handleSubmit() {
    sendRoomMessageMutation.mutate({
        id : id,
        payload : {
            text : message,
            data : ''
        }
    })


    setMessage("")

  } 

  return (
    <div className="h-screen bg-zinc-950 text-white flex">

      <div className="hidden md:flex w-[300px] border-r border-zinc-900 flex-col">

        <div className="p-4 border-b border-zinc-900">

          <div className="flex items-center gap-3">

            <div className="size-11 rounded-2xl bg-zinc-900 flex items-center justify-center shrink-0">
              <Hash className="size-5 text-zinc-400" />
            </div>

            <div className="min-w-0">
              <h2 className="font-semibold truncate">
                {room?.slug}
              </h2>

              <p className="text-sm text-zinc-500 truncate">
                {room?.description}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-zinc-900 flex items-center justify-between">

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

            const isOnline = onlineUsers.has(member.id)

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 transition"
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
                    <div className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-medium truncate">
                    {member.userName}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {isOnline
                      ? "online"
                      : "offline"}
                  </p>

                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">

        <div className="h-16 border-b border-zinc-900 px-4 flex items-center justify-between">

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

              <DropdownMenuContent className="bg-zinc-950 border-zinc-800 text-white">

                <DropdownMenuItem>
                  Room Info
                </DropdownMenuItem>

                <DropdownMenuItem>
                  Invite Members
                </DropdownMenuItem>

                <DropdownMenuItem className="text-red-500">
                  Leave Room
                </DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

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
                        console.log(id, text)
                    }}
                />
            ))}

        </div>

        <div className="border-t border-zinc-900 p-4">

          <div className="flex items-center gap-3">

            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              className="h-12 bg-zinc-900 border-zinc-800 rounded-2xl focus-visible:ring-0 focus-visible:border-zinc-700"
            />

            <Button
                onClick={handleSubmit}
              size="icon"
              className="h-12 w-12 rounded-2xl"
            >
              <SendHorizonal className="size-5" />
            </Button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomPage