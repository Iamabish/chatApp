import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createRoom,
  updateRoom,
  joinRoom,
  leaveRoom,
  sendMessage,
  editRoomMessage,
  deleteRoomMessage,
  addMemberToRoom,
  removeRoomMember,
} from "../api/room"

import { toast } from "sonner"
import { useSession } from "@/lib/auth.client"

export default function useRoom(roomId? : string) {

    const {data} = useSession()

    const userId = data?.user.id

    const queryClient = useQueryClient()

  const createRoomMutation = useMutation({

    mutationFn: (payload: {
      slug: string
      description?: string
    }) =>
      createRoom(payload),

    onSuccess: (res) => {

        console.log('id', res?.data?.id);
        

        queryClient.invalidateQueries({
            queryKey : ["room", res?.data?.id]
        })

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

  const inviteRoomMemberMutation = useMutation({
        mutationFn: ({
            roomId,
            userId,
        }: {
            roomId: string
            userId: string
        }) =>
            addMemberToRoom(
            roomId,
            userId
            ),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
            queryKey: ["room", variables.roomId],
            })

           

            toast.success(
            "Member added successfully"
            )
        },

        onError: (err) => {
            console.log(err)

            toast.error(
            "Failed to add member"
            )
        },
    })


    const removeRoomMemberMutation = useMutation({
        mutationFn: ({
            roomId,
            userId,
        }: {
            roomId: string
            userId: string
        }) =>
            removeRoomMember(roomId, userId),

        onSuccess: (_, variables) => {
                queryClient.invalidateQueries({
                queryKey: ["room", variables.roomId],
            })

            toast.success(
            "Member removed successfully"
            )
        },

        onError: (err) => {
            console.log(err)

            toast.error(
            "Failed to add member"
            )
        },
    })

    const joinRoomMutation = useMutation({
        mutationFn: ({ id }: { id: string }) => joinRoom(id),

        onSuccess: (_, variables) => {

            queryClient.invalidateQueries({
                queryKey: ["sidebar-rooms"],
            })

            queryClient.invalidateQueries({
                queryKey: ["room", variables.id],
            })

            queryClient.invalidateQueries({
                queryKey: ["searchRooms"],
            })

            toast.success("Joined room successfully")
        },
    })





    const leaveRoomMutation = useMutation({
        mutationFn: ({ id }: { id: string }) =>
            leaveRoom(id),

          onSuccess: (_, variables) => {

            queryClient.invalidateQueries({
                queryKey: ["sidebar-rooms"],
            })

            queryClient.invalidateQueries({
                queryKey: ["room", variables.id],
            })

            queryClient.invalidateQueries({
                queryKey: ["searchRooms"],
            })

            toast.success("Room left successfully")
        },

        onError :(err : any) => {
            console.log(err)

            toast.error("Failed to leave room")
        }
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


        const tempId = `temp-${Date.now()}`

        const tempMessage = {
            id: tempId,
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

        return { prevData, tempId }

    },


    onSuccess : (res, variables, context) =>{
        const realMessage = res.data

        queryClient.setQueryData(
            ['roomChats', variables.id],
            (old : any) => {
                if(!old) return old
                return {
                    ...old,
                    pages : old.pages.map((page : any) => ({
                        ...page,
                        data : {
                            ...page.data,
                            data : page.data.data.map((msg : any) => 
                                msg.id === context.tempId ? realMessage : msg
                            )
                        }
                    }))
                    
                }
            }
        )
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
    editRoomMessageMutation,
    inviteRoomMemberMutation,
    removeRoomMemberMutation
  }
}