import MessageBubble from "./MessageBubble"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Paperclip,
  SendHorizontal,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { getMessages, uploadFile } from "@/api/chat"
import { useNavigate, useParams } from "react-router"
import { useSession } from "@/lib/auth.client"
import React, {  useEffect, useRef, useState } from "react"

import useMessage from "@/hooks/useMessaage"
import { useSocketStore } from "@/store/socket/useSocket"

const Chat = () => {


    const navigate = useNavigate()

  const [sendData, setSendData] = useState("")
  const [imagePreview, setImagePreview] = useState("")

  const [editingMessage, setEditingMessage] = useState<{
    id: string
    text: string
  } | null>(null)

  const [uploadedFileUrl, setUploadedFileUrl] = useState("")
  const [uploading, setUploading] = useState(false)   

  const containerRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const loadingOldMessagesRef = useRef(false)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const initialLoad = useRef(null);




  const { id: receiverId } = useParams()

  const { data: user } = useSession()

  const userId = user?.user.id

  const {
    sendMessage,
    editMessageMutation,
    deleteAllMessageMutation,
  } = useMessage(receiverId)

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteQuery({

    queryKey: ["messages", receiverId],

    queryFn: ({ pageParam = 1 }) =>
      getMessages(receiverId!, pageParam),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {

      const current = lastPage.data.currPage

      const total = lastPage.data.total_pages

      return current < total
        ? current + 1
        : undefined
    },

    staleTime: 0,
  })

    const messages = data?.pages.flatMap((page) => page.data.data).reverse() || []

    const queryClient = useQueryClient()

  
    const allUsersData: any =
    queryClient.getQueryData(["sidebar-users"])

    const allUsers =
    allUsersData?.pages.flatMap(
        (page: any) => page.data.data
    ) || []

  
    const currentChatUser = allUsers.find(
    (user: any) => user.id === receiverId
    )

    const chatToAvatar =
    currentChatUser?.avatarUrl || ""

    const chatToUsername =
    currentChatUser?.userName || ""

    const { onlineUsers } = useSocketStore()

    
  function handleSubmit() {

    console.log('at handle submit');
    


    if (!sendData.trim() &&  !uploadedFileUrl) return

    if (editingMessage) {

      editMessageMutation.mutate({
        id: editingMessage.id,

        payload: {
          text: sendData,
          data : uploadedFileUrl
        },
      })

      setEditingMessage(null)

    } else {

      console.log('at else');
      console.log(receiverId);
      console.log(sendData);
      console.log(uploadedFileUrl);
      
      sendMessage.mutate({
        receiverId: receiverId!,
        text: sendData,
        data : uploadedFileUrl
      })
    }

    setSendData("")
    setUploadedFileUrl("")
  }

    async function handleUploadFile(file: File) {

        console.log('at handle upload ');
    
        if (!file) return

        try {

            setUploading(true)

            const formData = new FormData()

            formData.append("file", file)

            const res = await uploadFile(formData)

            setUploadedFileUrl(res.data.url)

        } catch (err) {

            console.log(err)

        } finally {

            setUploading(false)
        }
    }


    

  function handleEdit(
    id: string,
    text: string
  ) {

    setEditingMessage({
      id,
      text,
    })

    setSendData(text)
  }

  function handleClearChat(
    flag: "me" | "everyone"
  ) {

    deleteAllMessageMutation.mutate({
      receiverId: receiverId!,
      flag,
    })
  }

  async function loadOldMessage() {
    const container = containerRef.current

    if(
      !container ||
      !hasNextPage ||
      isFetchingNextPage
    ) return 


    loadingOldMessagesRef.current = true

    const prevHeight = container.scrollHeight


    await fetchNextPage()

    requestAnimationFrame(() => {

      const newHeight = container.scrollHeight

      container.scrollTop += newHeight - prevHeight

      loadingOldMessagesRef.current = false
    })
  }

  async function handleScroll(e : React.UIEvent<HTMLDivElement>){
    const container = e.currentTarget

    if(container.scrollTop < 100 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      await loadOldMessage()
    }
  }


  useEffect(()=> {


    if(loadingOldMessagesRef.current) return

    const container = containerRef.current;

    if(!container) return


    if(initialLoad) {
      bottomRef.current.scrollIntoView({
        behavior : "smooth"
      })

      initialLoad.current = false
      return
    }


    const isNear = 
    container.scrollHeight -
    container.scrollTop - 
    container.clientHeight < 100


    if(isNear) {
      bottomRef.current.scrollIntoView({
        behavior : "smooth"
      })      
    }
  }, [messages.length])

  useEffect(() => {
    initialLoad.current = false
  }, [receiverId])


  return (
    <div className="flex h-screen flex-col bg-black text-white">


      <div className="border-b border-zinc-800 px-5 py-4 backdrop-blur-xl">

        <div className="mx-auto flex max-w-4xl items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="relative cursor-pointer   " onClick={() => navigate(`/profile/${receiverId}`)}>

              <Avatar className="h-12 w-12 border border-zinc-800">

                <AvatarImage
                  src={chatToAvatar}
                  alt={chatToUsername}
                />

                <AvatarFallback className="bg-zinc-900 text-zinc-200">

                  {chatToUsername
                    ?.slice(0, 2)
                    .toUpperCase()}

                </AvatarFallback>

              </Avatar>

              <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-black ${onlineUsers.includes(receiverId as string) ? 'bg-emerald-500' : ""}`} />

            </div>

            <div className="flex flex-col">

              <h4 className="text-sm font-semibold tracking-tight text-zinc-100">
                {chatToUsername}
              </h4>

              <span className="text-xs text-zinc-500">
                {onlineUsers.includes(receiverId as string) ? "Active Now" : 'Touching the Grass'}
              </span>

            </div>

          </div>

          <DropdownMenu>

            <DropdownMenuTrigger asChild>

              <Button
                size="icon"
                variant="ghost"
                className="rounded-full text-zinc-400 hover:bg-zinc-900 hover:text-white"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>

            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52 border-zinc-800 bg-zinc-950 text-zinc-100"
            >

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  handleClearChat("me")
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Chat For Me
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-zinc-800" />

              <DropdownMenuItem
                className="cursor-pointer text-red-500 focus:text-red-500"
                onClick={() =>
                  handleClearChat("everyone")
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Chat For Everyone
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        </div>

      </div>


      <div className="flex-1 overflow-y-auto px-4 py-6" 
      ref={containerRef}
      onScroll={handleScroll}
      >

        <div className="mx-auto flex max-w-4xl flex-col gap-4">

          {messages?.map((message) => {

            const isOwnMessage =
              message.senderId === userId

            const messageUser = isOwnMessage
              ? message.sender
              : message.sender

            return (
              <MessageBubble
                key={message.id}

                id={message.id}

                isOwnMessage={isOwnMessage}

                avatar={messageUser?.avatarUrl}

                userName={messageUser?.userName}

                text={message.text}
                data={message.data}

                createdAt={message.createdAt}

                receiverId={receiverId}

                onEdit={handleEdit}
              />
            )
          })}

        </div>
      <div ref={bottomRef}></div>


      </div>



    <div className="border-t border-zinc-800 bg-black px-4 py-4">

    {editingMessage && (

        <div className="mb-2 flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-2 text-xs text-zinc-400">

        <span>
            Editing message
        </span>

        <button
            onClick={() => {
            setEditingMessage(null)
            setSendData("")
            }}
        >
            Cancel
        </button>

        </div>
    )}

    {imagePreview && (
        <div className="mx-auto mb-2 flex max-w-4xl justify-start">

            <div className="relative ml-14 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-1.5">

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

            setImagePreview(URL.createObjectURL(file))

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
        value={sendData}
        onChange={(e) =>
            setSendData(e.target.value)
        }
        className="border-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <Button
        onClick={handleSubmit}
        size="icon"
        disabled={uploading}
        className="shrink-0 rounded-xl bg-white text-black hover:bg-zinc-200"
        >
        <SendHorizontal className="h-5 w-5" />
        </Button>

    </div>

    </div>

    </div>
  )
}

export default Chat