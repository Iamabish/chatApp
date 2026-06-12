import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createMessage,
  editMessage,
  deleteMessage,
  deleteAllMessage,
} from "../api/chat"

import { useSession } from "@/lib/auth.client"
import { toast } from "sonner"

export default function useMessage(receiverId: string) {

  const { data: user } = useSession()

  const userId = user?.user.id

  const queryClient = useQueryClient()

 const sendMessage = useMutation({
  mutationFn: ({
    receiverId,
    text,
    data,
  }: {
    receiverId: string
    text?: string
    data?: string
  }) =>

    createMessage(receiverId, {
      text,
      data,
    }),

  onMutate: async (variables) => {

    
    
  
    await queryClient.cancelQueries({
      queryKey: ["messages", receiverId],
    })

    const prevData = queryClient.getQueryData([
      "messages",
      receiverId,
    ])

    

    const tempId = `temp${Date.now()}`

    const tempMessage = {
      id: tempId,
      text: variables.text,
      data: variables.data || "",
      senderId: userId,
      receiverId,
      sender: {
        userName: user?.user?.name,
        avatarUrl: user?.user?.image,
      },
      receiver: {
        userName: null,
        avatarUrl: null,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    queryClient.setQueryData(
      ["messages", variables.receiverId],
      (old: any) => {
        if (!old) return old

        return {
          ...old,
          pages: old.pages.map((page: any, index: number) =>
            index === 0
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
          ),
        }
      }
    )


    console.log(
  queryClient.getQueryData([
    "messages",
    receiverId,
  ])
)

    return { prevData, tempId }
  },


  

  onSuccess: (res, variables, context) => {
    const realMessage = res.data

    queryClient.setQueryData(
      ["messages", variables.receiverId],
      (old: any) => {
        if (!old) return old

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data.data.map((msg: any) =>
                msg.id === context?.tempId
                  ? realMessage
                  : msg
              ),
            },
          })),
        }
      }
    )
  },

  onError: (err: any, __, context: any) => {
    toast.error("Failed to send message")

    console.log("err", err)

    queryClient.setQueryData(
      ["messages", receiverId],
      context?.prevData
    )
  },
})

  const editMessageMutation = useMutation({

    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: {
        text: string
        data?: string
      }
    }) =>
      editMessage(id, payload),

    onMutate: async (variables) => {

      await queryClient.cancelQueries({
        queryKey: ["messages", receiverId],
      })

      const prevData = queryClient.getQueryData([
        "messages",
        receiverId,
      ])

      queryClient.setQueryData(
        ["messages", receiverId],
        (old: any) => {

          if (!old) return old

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((msg: any) =>
                msg.id === variables.id
                  ? {
                      ...msg,
                      text: variables.payload.text,
                      data: variables.payload.data,
                    }
                  : msg
              ),
            })),
          }
        }
      )

      return { prevData }
    },

    onError: (_, __, context: any) => {

      toast.error("Failed to edit message")

      queryClient.setQueryData(
        ["messages", receiverId],
        context?.prevData
      )
    },

    onSuccess: async () => {

      await queryClient.invalidateQueries({
        queryKey: ["messages", receiverId],
      })
    },
  })

  const deleteMessageMutation = useMutation({

    mutationFn: ({
      id,
      flag,
    }: {
      id: string
      flag: "me" | "everyone"
    }) =>
      deleteMessage(id, flag),

    onMutate: async (variables) => {

      await queryClient.cancelQueries({
        queryKey: ["messages", receiverId],
      })

      const prevData = queryClient.getQueryData([
        "messages",
        receiverId,
      ])

      queryClient.setQueryData(
        ["messages", receiverId],
        (old: any) => {

          if (!old) return old

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.filter(
                (msg: any) =>
                  msg.id !== variables.id
              ),
            })),
          }
        }
      )

      toast.success("Message deleted successfully")

      return { prevData }
    },

    onError: (_, __, context: any) => {

      toast.error("Failed to delete message")

      queryClient.setQueryData(
        ["messages", receiverId],
        context?.prevData
      )
    },

    onSuccess: async () => {

      await queryClient.invalidateQueries({
        queryKey: ["messages", receiverId],
      })
    },
  })

  const deleteAllMessageMutation = useMutation({

    mutationFn: ({
      receiverId,
      flag,
    }: {
      receiverId: string
      flag: "me" | "everyone"
    }) =>
      deleteAllMessage(receiverId, flag),

    onSuccess: async () => {

      await queryClient.invalidateQueries({
        queryKey: ["messages", receiverId],
      })
    },

    onError: (err) => {

      console.log(err)

      toast.error("Failed to clear chat")
    },
  })

  return {
    sendMessage,
    editMessageMutation,
    deleteMessageMutation,
    deleteAllMessageMutation,
  }
}