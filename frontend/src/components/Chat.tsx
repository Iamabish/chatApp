

import MessageBubble from "./MessageBubble"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Paperclip,
  SendHorizontal,
  MoreVertical,
} from "lucide-react"
import { useInfiniteQuery, useMutation } from "@tanstack/react-query"
import { createMessage, getMessages } from "@/api/chat"
import { useParams } from "react-router"
import { useSession } from "@/lib/auth.client"
import { useState } from "react"
import useMessage from "@/api/useMessaage"



const Chat = () => {

    console.log('chat bar  rendered ');

    const [sendData, setSendData] = useState('')

    


    const {id : receiverId} = useParams()

    console.log('user to chat id', receiverId);
    
     const { data : user } = useSession()
        const userId = user?.user.id

        const { sendMessage } = useMessage()

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
    
    queryKey: ["messages", receiverId],

    queryFn: ({ pageParam = 1 }) =>
        getMessages(receiverId, pageParam),

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


    const messages = data?.pages.flatMap((page) => page.data) || []

    // bug here
    const chatToAvatar = messages[0]?.receiver.avatarUrl
    const chatToUsername = messages[0]?.receiver?.userName

    console.log(chatToAvatar);
    console.log(chatToUsername);

    // incorrect ids 
    //


    function handleSubmit() {

        console.log('submit handler ');
        
        sendMessage.mutate({
            receiverId : receiverId,
            text : sendData
        })

       console.log(sendMessage.isSuccess);
    
    }


  return (
    <div className="flex h-screen flex-col bg-black text-white">
     
      <div className="border-b border-zinc-800 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border border-zinc-800">
                <AvatarImage src={ chatToAvatar || ''} alt="username" />

                <AvatarFallback className="bg-zinc-900 text-zinc-200">
                     {chatToUsername?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-black bg-emerald-500" />
            </div>

            <div className="flex flex-col">
              <h4 className="text-sm font-semibold tracking-tight text-zinc-100">
                {chatToUsername}
              </h4>

              
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="rounded-full text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          {messages.map((message) => {

            const isOwnMessage =
                message.senderId === userId

            return (
                <MessageBubble
                    key={message.id}

                    isOwnMessage={isOwnMessage}

                    avatar={message.sender?.avatarUrl}

                    userName={message.sender?.userName}

                    text={message.text}

                    createdAt={message.createdAt}
                />
            )
            })}
        </div>
      </div>

      <div className="border-t border-zinc-800 bg-black px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 shadow-lg">
          
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Input
            placeholder="Type a message..."
            className="border-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) => setSendData(e.target.value)}
          />

          <Button
            onClick={handleSubmit}
            size="icon"
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