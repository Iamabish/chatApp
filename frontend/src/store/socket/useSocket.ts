import { QueryClient } from "@tanstack/react-query"
import { create } from "zustand"

  type Message = {
    text: string
    senderId: string
  }

  interface SocketStore {
    socket: WebSocket | null
    isConnected: boolean,
    connectedUserid : string | null,
    chats: Message[]
    onlineUsers : string[],
    joinedRooms : string[],
    typingUsersRoom : {
      [roomId : string] : {
          [userId : string] : string
      }
    }
    onlineInRoom : {
      [key : string] : Set<string>
    },
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
      connectedUserid : null,
      chats: [],

      onlineUsers: [] ,
      joinedRooms : [],
      onlineInRoom  : {},
      typingUsersRoom : {},
      
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
          connectedUserid : userId
        })



        socket.onopen = () => {

          socket?.send(
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
              
              console.log('online user', data.users);
              

              set(() => ({
                onlineUsers: data.users,
              }))

              break


            case 'member-added' : {
              console.log('case member added');
              const {roomId, onlineUsers} = data

             set((state) => ({
                onlineInRoom : {
                  ...state.onlineInRoom,
                  [roomId] : new Set(onlineUsers)
                }
             }))

             break
            } 



            case "member-removed" : {

              console.log('case member removed');

              const {roomId, onlineUsers, userId} = data

            
                set((state) => ({
                  onlineInRoom :{
                  ...state.onlineInRoom,
                  [roomId] : new Set(
                    onlineUsers
                  )
                  }
                }))


                console.log('will remove',get().connectedUserid === userId);
                

                if(get().connectedUserid === userId){
                  window.location.href = '/'
                }
                break
            }






            case "delete-message":

              console.log('case delete message hit');

              const qc = get().queryClient

              if(qc) {

                qc.setQueryData(["messagas", data.senderId],

                  (old : any) => {
                      if(!old) return old
                      pages : old.pages.map((page : any) => ({
                          ...page,
                          data : page.data.filter((msg : any) => msg.id !== data.messageId)
                      }))
                  }

                )

              }
              
              
          
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

                      const {  roomId, onlineUsers,  } = data

                    

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


                  case "room-online-sync" : {
                      const {roomId, onlineUsers} = data                      

                      set((state) => ({
                          onlineInRoom :{
                              ...state.onlineInRoom,
                              [roomId] : new Set(
                                  onlineUsers
                              )
                          }
                      }))
                      break
                  }


                  case "room-message-send": {

                      console.log('at room message send');

                      const {payload} = data

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


                  case "user-left-room" :{
                      const {  roomId, onlineUsers } = data


                      console.log('case user left room');
  

                      set((state) => ({
                          onlineInRoom :{
                              ...state.onlineInRoom,
                              [roomId] : new Set(
                                  onlineUsers
                              )
                          }
                      }))
                      
                      
                      break
                      
                  }



                  case "typing" : {
                      const {userId, userName, roomId} = data


                      set((state) => ({
                          typingUsersRoom : {
                              ...state.typingUsersRoom,
                              [roomId] : {
                                  ...(state.typingUsersRoom[roomId] || {}),
                                  [userId] : userName
                              }
                          }
                    
                      }))
                      break

                  }       


                  case "stopped-typing" : {
                      const {userId, roomId} = data

                      

                      set((state) => {
                        
                        const roomTypers = {...(state.typingUsersRoom[roomId] || {})}

                        delete roomTypers[userId]
                        

                        return {
                          typingUsersRoom :{
                            ...state.typingUsersRoom,
                            [roomId] : roomTypers
                          }
                        }
                      })

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