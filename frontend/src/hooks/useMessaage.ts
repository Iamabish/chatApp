import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createMessage,
  editMessage,
  deleteMessage,
  deleteAllMessage,
} from "../api/chat"
import { useSession } from "@/lib/auth.client"
import { toast } from "sonner";

export default function useMessage(receiverId : string) {


  console.log('receiver id', receiverId);
  

  const { data : user } = useSession()
  const userid = user?.user.id

  const queryClient = useQueryClient()

  const sendMessage = useMutation({

    mutationFn: ({
      receiverId,
      text,
      data
    }: {
      receiverId: string
      text: string,
      data : string
    }) =>
      createMessage(receiverId, { text, data }),


      onMutate : async (variables) => {
          
        await queryClient.cancelQueries({queryKey : ["messages", receiverId]})

        const prevData = queryClient.getQueryData(["messages", receiverId])
        
        const tempMessage ={
          id : `{temp-${Date.now()}`,
          text : variables.text,
          senderId: userid,
          receiverId : receiverId,
          sender : { userName : user?.user?.name, avatarUrl : user?.user?.image },
          receiver : { userName : null, avatarUrl : null},
          createdAt : new Date().toISOString(),
          updatedAt : new Date().toISOString()
        }
       
        queryClient.setQueryData(
          ["messages", receiverId],
          (old : any) => {
            if(!old) return old
            return {
              ...old,
              pages : old.pages.map((page : any, index : number) => 

                index === old.pages.length - 1
                ? {...page, data : [...page.data, tempMessage]}
                : page

              )

            }

          }
        )

        return { prevData }

      },

       onError: (_, __, context) => {
          queryClient.setQueryData(["messages", receiverId], context.prevData)
      },

      


    onSuccess: async () => {

      await queryClient.invalidateQueries({
        queryKey: ["messages", receiverId],
      })
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

      onMutate : async(variables) => {
        await queryClient.cancelQueries({queryKey : ["messages", receiverId]})

        const prevData = queryClient.getQueryData(["messages", receiverId])

        queryClient.setQueryData(
          ["messages", receiverId],
          (old : any) => {
            if(!old) return old
            return {
              ...old,
              pages : old.pages.map((page : any) => ({
                ...page,
                data : page.data.map((msg : any) => 
                  msg.id === variables.id 
                  ? {...msg, text : variables.payload.text}
                  : msg
                )
              }))
            }
          }
        )

        return { prevData }


      },

    onError: (_, __, context) => {
      toast.error('Failed to edit message')
      queryClient.setQueryData(["messages", receiverId], context.prevData)
    },
  })



  const deleteMessageMutation = useMutation({
      mutationFn: ({ id, flag }: { id: string, flag: "me" | "everyone" }) =>
          deleteMessage(id, flag),

      onMutate : async (variables) => {
        await queryClient.cancelQueries({queryKey : ["messages", receiverId]})

        const prevData = queryClient.getQueryData(["messages", receiverId])



          queryClient.setQueryData(
              ["messages", receiverId],
              (old: any) => {
                  if (!old) return old
                  return {
                      ...old,
                      pages: old.pages.map((page: any) => ({
                          ...page,
                          data: page.data.filter((msg: any) => msg.id !== variables.id)
                      }))
                  }
              }
          )

          toast.success("Message delete successfully")

          return { prevData }
      },

      


      onError : (_, __, context) => {
        toast.error('Failed to delete message')
        queryClient.setQueryData(["messages", receiverId], context.prevData)
        
      }
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


      onMutate : async (variables) => {

        await queryClient.cancelQueries({queryKey : ["messages", receiverId]})

        const prevData = queryClient.getQueryData(["messages", receiverId])


        queryClient.setQueryData(
          ["messages", receiverId],
          (old : any) => {
            if(!old) return old

            return  {
              ...old,
             pages : old.pages.map((page : any) => ({
              ...page,
              data : []
             }))
            }
            
          }
        )

        toast.success("Message cleared  successfully")

        return  { prevData }

      },

      onError : (_, __, context) => {
        toast.error('Failed to delete message')
        queryClient.setQueryData(["messages", receiverId], context.prevData)
        
      },
        
      
  
  })



  return {
    sendMessage,
    editMessageMutation,
    deleteMessageMutation,
    deleteAllMessageMutation,
  }
}