import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createRoom,
  updateRoom,
  joinRoom,
  leaveRoom,
  sendMessage,
  editRoomMessage,
  deleteRoomMessage,
} from "../api/room"

import { toast } from "sonner"
import { useSession } from "@/lib/auth.client"
import { id } from "zod/v4/locales"

export default function useRoom(roomId : string) {

    const {data} = useSession()

    const userId = data?.user.id

    const queryClient = useQueryClient()

  const createRoomMutation = useMutation({

    mutationFn: (payload: {
      slug: string
      description?: string
    }) =>
      createRoom(payload),

    onSuccess: () => {

      toast.success("Room created successfully")
    },

    onError: (err) => {

      console.log(err)

      toast.error("Failed to create room")
    },
  })

  const updateRoomMutation = useMutation({

    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: {
        slug?: string
        description?: string
      }
    }) =>
      updateRoom(id, payload),

    //   onMutate : (variables) => {

    //     queryClient.cancelQueries({queryKey : ["roomChasts", roomId]})

    //     const prevData = queryClient.getQueryData(["roomChats", id])



    //   },

    onSuccess: () => {

        queryClient.invalidateQueries({
            queryKey : ["rooom", roomId]
        })

      toast.success("Room updated successfully")
    },

    onError: (err) => {

      console.log(err)

      toast.error("Failed to update room")
    },
  })

  const joinRoomMutation = useMutation({

    mutationFn: (id: string) =>
      joinRoom(id),

    onSuccess: () => {

      toast.success("Joined room successfully")
    },

    onError: (err) => {

      console.log(err)

      toast.error("Failed to join room")
    },
  })

  const leaveRoomMutation = useMutation({

    mutationFn: ({id} : {id : string}) => leaveRoom(id),


    onMutate : async (variables) => {
        queryClient.cancelQueries({
            queryKey : ["room", id],
        })

        const prevData = queryClient.getQueryData(["room", id])

        queryClient.setQueryData(
            ['room', id],
            (old : any) => {
                if(!old) return old
                return {    
                    ...old,
                    pages : old.pages.map((page : any) => ({
                        ...page,
                        data : page.data.member.filter((uid : any) => 
                            uid.id !== userId
                        )
                    }))
                }
            }
        )


    return { prevData }
    },

    onError: (_, __, context) => {

      queryClient.setQueryData(["room", roomId], context.prevData)

      toast.error("Failed to leave room")
    },


    onSuccess: async () => {

        await  queryClient.invalidateQueries({
            queryKey : ["room", roomId]
        })

    },

    
  })

  const sendRoomMessageMutation = useMutation({

    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: {
        text?: string
        data?: string
      }
    }) =>
      sendMessage(id, payload),


      onMutate : async (variables) => {


        await queryClient.cancelQueries({
            queryKey : ['roomChats', variables.id]
        })

        
        const prevData = queryClient.getQueryData([
            "roomChats",
            roomId,
        ])

        const tempMessage = {
            id: `temp-${Date.now()}`,
            text: variables.payload.text,
            data: variables.payload.data || "",
            senderId: userId,
            roomId : variables.id,
            sender: {
            userName: data?.user?.name,
            avatarUrl: data?.user?.image,
            },
            receiver: {
            userName: null,
            avatarUrl: null,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }


        queryClient.setQueryData(
            ["roomChats", variables.id],
            (old: any) => {

                if (!old) return old
                return {
                ...old,
                pages: old.pages.map(
                    (page: any, index: number) =>
                    index === old.pages.length - 1 
                        ? {
                            ...page,
                            data: {
                            ...page.data,
                            data: [
                                tempMessage,
                                ...page.data.data,
                            ],
                            },
                        }
                        : page
                    )   ,
                }
            }
        )

        return { prevData }

    },

    onError: (_, __, context) => {

        console.log('inside erro ?? ');
        

      queryClient.setQueryData(['roomChats', roomId], context.prevData)
      toast.error("Failed to send message")
    },
   
  })


  const editRoomMessageMutation = useMutation({
  
      mutationFn: ({
        id,
        payload,
      }: {
        id: string
        payload: {
          text: string
          data?: string
          messageId : string
        }
      }) =>
        editRoomMessage(id, payload),
  
      onMutate : async (variables) =>{


        await queryClient.cancelQueries({
            queryKey : ['roomChats', variables.id]
        })

        
        const prevData = queryClient.getQueryData([
            "roomChats",
            roomId,
        ])

        queryClient.setQueryData(
            ["roomChats", variables.id],
            (old : any) => {
                if(!old) return old
                return {
                    ...old,
                    pages : old.pages.map((page : any ) => ({
                        ...page,
                        data :{
                            ...page.data,
                            data : page.data.data.map((msg : any) => 
                                msg.id === variables.payload.messageId ?
                                {
                                    ...msg,
                                    text : variables.payload.text,
                                    data : variables.payload.data,
                                    updatedAt : new Date().toISOString()
                                } : msg
                            )
                        }
                    }))
                }
            }

            
        )

        return { prevData }
      },
  
      onError: (_, __, context: any) => {
  
        toast.error("Failed to edit message")
  
        queryClient.setQueryData(
          [ "roomChats", roomId,],
          context?.prevData
        )
      },
    })

  const deleteRoomMessageMutation = useMutation({

    mutationFn: ({
        id,
        payload,
    }: {
        id: string
        payload: {
        messageId: string
        flag: "me" | "everyone"
        }
    }) =>
        deleteRoomMessage(id, payload),

        onMutate: async (variables) => {

            await queryClient.cancelQueries({
            queryKey: ["roomChats", roomId]
            })

            const prevData = queryClient.getQueryData([
            "roomChats",
            roomId,
            ])

            queryClient.setQueryData(
            ["roomChats", roomId],
            (old: any) => {
                if (!old) return old
                return {
                ...old,
                pages: old.pages.map(
                    (page: any) => ({
                    ...page,
                    data: {
                        ...page.data,
                        data: page.data.data.filter(
                        (msg: any) =>
                            msg.id !== variables.payload.messageId
                        )
                    }
                    })
                )
                }
            }
            )
            return { prevData }
        },
        onError: (_, __, context: any) => {

            queryClient.setQueryData(
            ["roomChats", roomId],
            context.prevData
            )

            toast.error(
            "Failed to delete message"
            )
        },
    })

  return {
    createRoomMutation,
    updateRoomMutation,
    joinRoomMutation,
    leaveRoomMutation,
    sendRoomMessageMutation,
    deleteRoomMessageMutation,
    editRoomMessageMutation
  }
}