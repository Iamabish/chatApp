import { WebSocketServer, WebSocket } from "ws"

type UserSocketMap = {
    [userId  : string] : WebSocket
}


export let onlineUser : UserSocketMap = {}

export let wss : WebSocketServer;

export default function initSocket(server : any) {
    
    wss = new WebSocketServer({server})


    wss.on("connection", (socket)=> {

        socket.on("message", (data) => {

            let message = JSON.parse(data.toString())

            if(message.type === "join") {
                onlineUser[message.userId] = socket
            }


            
        })


        socket.on("close", ()=> {
            for(let userid in onlineUser) {
                if(onlineUser[userid] === socket) {
                    delete onlineUser[userid]
                }
            }


            console.log('user disconnected');
            
        })
    })
}

