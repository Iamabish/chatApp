import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createMessage } from "./chat"

export default function useMessage() {

    

    const queryClient = useQueryClient()

    const sendMessage = useMutation({

    mutationFn: ({
      receiverId,
      text,
    }: {
        receiverId : string,
        text : string
    }) =>
        createMessage(receiverId, { text }),

        onSuccess: async (newMessage, variables) => {
            console.log('invalidating:', ["messages", variables.receiverId])
            console.log('active queries:', queryClient.getQueryCache().getAll().map(q => q.queryKey))
            
            await queryClient.invalidateQueries({
                queryKey: ["messages", variables.receiverId],
            })
            
            console.log('cache after invalidate:', queryClient.getQueryData(["messages", variables.receiverId]))
        },

    onError: (err) => {
      console.log(err)
    },
  })

  return {
    sendMessage,
  }
}