import { QueryClient } from "@tanstack/react-query"
import { create } from "zustand"

type Message = {
  text: string
  senderId: string
}

interface SocketStore {
  socket: WebSocket | null
  isConnected: boolean
  chats: Message[]
  onlineUsers : string[],
  joinedRooms : string[],
  onlineInRoom : {
    [key : string] : Set<string>
  }

  sendMessage: (payload: any) => void

  connect: (userId: string) => void,


  disconnect: () => void,
  

  error: string | null

  queryClient: QueryClient | null

  setQueryClient: (qc: QueryClient) => void,

}

export const useSocketStore = create<SocketStore>(
  (set, get) => ({

    socket: null,

    isConnected: false,

    chats: [],

    onlineUsers: [] ,
    joinedRooms : [],
    onlineInRoom  : {},
    
    error: null,

    queryClient: null,



    setQueryClient: (qc) => {
      set({
        queryClient: qc,
      })
    },


    


    connect: (userId: string) => {

      if (get().socket) return

      const socket = new WebSocket(
        "ws://localhost:8000"
      )

      set({
        socket,
        isConnected: true,
      })



      socket.onopen = () => {

        socket.send(
          JSON.stringify({
            type: "join",
            userId,
          })
        )
      }



      socket.onmessage = async (event) => {

        const data = JSON.parse(event.data)

        console.log("message on socket", data)



        switch (data.type) {

          case "new-message":

            console.log("case new message")

            {
              const qc = get().queryClient

              if (qc) {
                await qc.refetchQueries({
                  queryKey: [
                    "messages",
                    data.senderId,
                  ],

                  type: "all",
                })
              }
            }

            set((state) => ({
              chats: [
                ...state.chats,
                data.message,
              ],
            }))

            break



          case "online-users":

            console.log("case online user")

            set(() => ({
              onlineUsers: data.users,
            }))

            break



          case "delete-message":

            console.log('case delete message hit');

            const qc = get().queryClient
            
            qc.setQueryData(["messagas", data.senderId],

                (old : any) => {
                    if(!old) return old
                    pages : old.pages.map((page : any) => ({
                        ...page,
                        data : page.data.filter((msg : any) => msg.id !== data.messageId)
                    }))
                }

            )
        
            break

          case "delete-all-message":

            console.log(
              "case delete all message"
            )

            {
              const qc = get().queryClient
              if (qc) {
                qc.setQueryData(["messages", data.senderId],
                (old : any) => {
                    if(!old) return old
                    return {
                        ...old,
                        pages : old.pages.map((page : any) => ({
                            ...page,
                            data : []
                        }))
                    }
                })
              }
            }

            break



          case "edit-message":

            console.log(
              "case edit message"
            )

            {
              const qc = get().queryClient

              if (qc) {

                if(qc) {
                    qc.setQueryData(["messages", data.senderId],
                    (old : any) => {
                        if(!old) return old
                        return {
                            ...old,
                            pages : old.pages.map((page : any) => ({
                                ...page,
                                data : page.data.map((msg : any) => 
                                    msg.id === data.data.id
                                    ? {...msg, text : data.data.text}
                                    : msg
                                )
                            }))
                        }
                    }
                    )
                }
                
              }
            }

            break



            case "user-joined-room": {

                    console.log("at user joined room case")

                    const {  roomId, userId, onlineUsers,  } = data

                    console.log('user joined room', userId);
                    

                    console.log(
                        "user joined room",
                        roomId
                    )

                    console.log(
                        "online users in room",
                        onlineUsers
                    )

                    set((state) => ({
                        onlineInRoom: {
                            ...state.onlineInRoom,
                            [roomId]: new Set(
                                onlineUsers
                            ),
                        },
                    }))

                    break
                }


                case "room-message-send": {

                    console.log('at room message send');

                    const {payload , userId, roomId} = data


                    console.log('sent by', userId);
                    console.log('to room', roomId);

                    console.log(payload)

                    const qc = get().queryClient

                    if (qc) {

                        qc.setQueryData(['roomChats', data.roomId], (old: any) => {
                            if (!old) return old
                            return {
                                ...old,
                                pages: old.pages.map((page: any, index: number) =>
                                    index === old.pages.length - 1 
                                        ? {
                                            ...page,
                                            data: {
                                                ...page.data,
                                                data: [payload, ...page.data.data]
                                            }
                                        }
                                        : page
                                )
                            }
                        })
                    }
                    break
                }


                case "edit-message-send": {

                    console.log("case at edit message send")

                    const { payload, roomId } = data

                    const qc = get().queryClient

                    if (qc) {

                        qc.setQueryData(
                        ["roomChats", roomId],
                        (old: any) => {

                            if (!old) return old

                            return {
                            ...old,

                            pages: old.pages.map((page: any) => ({
                                ...page,
                                data: {
                                ...page.data,
                                data: page.data.data.map((msg: any) =>
                                    msg.id === payload.id
                                    ? {
                                        ...msg,
                                        ...payload,
                                        }
                                    : msg
                                )
                                }
                            }))
                            }
                        }
                        )
                    }
                    break
                 }


                 case "room-message-delete" : {
                    const {roomId, messageId} = data

                    const qc = get().queryClient

                    if(qc) {
                        qc.setQueryData(["roomChats", roomId], 
                            (old : any) => {
                                if(!old) return old
                                return {
                                    ...old,
                                    pages : old.pages.map((page : any) => ({
                                        ...page,
                                        data : {
                                            ...page.data,
                                            data : page.data.data.filter((msg : any) => 
                                                msg.id !== messageId
                                            )
                                        }
                                    }))
                                }
                            }
                        )
                    }

                    break
                 }

          default:
            break
        }
      }



      socket.onclose = () => {

        console.log("user disconnected")

        set({
          socket: null,
          isConnected: false,
        })
      }
    },




    disconnect: () => {

      console.log("user disconnected")

      get().socket?.close()

      set({
        socket: null,
        isConnected: false,
      })
    },



    sendMessage: (payload) => {

      const socket = get().socket

      if (
        !socket ||
        socket.readyState !== WebSocket.OPEN
      ) {

        set({
          error: "Socket not connected",
        })

        return
      }

      socket.send(
        JSON.stringify(payload)
      )
    },

  })
)