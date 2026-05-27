import { string, uuid } from "better-auth"
import { WebSocketServer, WebSocket } from "ws"

type UserSocketMap = {
    [key : string] : {
        socket : WebSocket,
        rooms : Set<string>
    }
}




export let onlineUser : UserSocketMap = {}

export let wss : WebSocketServer;


export function getSocketId(id : string) {
    return onlineUser[id].socket
}




export default function initSocket(server : any) {

    console.log('socket is intializing ');
    
    
    wss = new WebSocketServer({server})


    wss.on("connection", (socket)=> {

        console.log('user is connected to the socket');
        

        socket.on("message", (data) => {

            console.log('message handler on socket backend');
            

            let message = JSON.parse(data.toString())


            console.log('message', message);
            

            if(message.type === "join") {

                const { userId } = message

                if(!onlineUser[userId]) {
                    onlineUser[userId] = {
                        socket : socket,
                        rooms : new Set()
                    }
                }

                onlineUser[userId].socket = socket


                let onlineUserList = Object.keys(onlineUser)

                console.log('onlin user list', onlineUserList);
                

                for(let userId  in onlineUser) {

                    const clientSocket = onlineUser[userId]

                    if(clientSocket.socket.readyState === WebSocket.OPEN) {
                        clientSocket.socket.send(JSON.stringify({
                            type : 'online-users',
                            users : onlineUserList
                        }))
                    }
                }
            }

        })


        socket.on("close", ()=> {
            for(let userid in onlineUser) {
                if(onlineUser[userid].socket === socket) {
                    delete onlineUser[userid]
                }
            }


            console.log('user disconnected');
            
        })
    })
}




