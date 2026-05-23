
import { create } from "zustand"


type Message = {
    text : string,
    senderId : string,
}




interface ScoketStore {
    socket : WebSocket,
    isConnected : boolean,
    chats : Message[],
    onlineUsers : string[],
    sendMessage : (payload : any) => void,
    connect : (userid : string) => void,
    disconnect : () => void, 
    error : string | null,
}


export const useSocketStore = create<ScoketStore>((set, get) => ({
    socket : null,
    isConnected : false,
    chats : [],
    onlineUsers : [],
    error : null,

    connect : (userId : string) => {

        if(get().socket) return;

        const socket = new WebSocket(
            "ws://localhost:8000"
        );

        set({
            socket : socket,
            isConnected : true
        })

        socket.onopen = () => {
            socket.send(JSON.stringify({
                type : 'join',
                userId : userId
            }))
        }


        socket.onmessage =  (event) => {

            const prevMessage = get().chats

            const data = JSON.parse(event.data)

          console.log('incoming messagee', data);
          
          switch(data.type) {
            
            case "new-message":
                set((state) => ({
                    chats : [...state.chats, data.message]
                }))
                break


            case "online-users":
                
                console.log('at online user');
            

                set((state) => ({
                    onlineUsers : data.users
                }))
                break


          }
            
        },


        socket.onclose = ()=> {
            console.log('user disconnected');

            set({
                socket : null,
                isConnected : false
            })
        }
    },


    disconnect : () => {
        console.log('user disconnected');
        set({
            socket : null,
            isConnected : false
        })
    },


    sendMessage : (payload) => {
        const socket = get().socket

        if(!socket || socket.readyState !== WebSocket.OPEN) {
            set({
                error : 'Socket not connected'
            })
            return
        }
        socket.send(JSON.stringify(payload))
    }



}))