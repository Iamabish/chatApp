import { WebSocketServer, WebSocket } from "ws"

type UserSocketMap = {
    [key : string] : WebSocket
}

export let onlineUser : UserSocketMap = {}

export let wss : WebSocketServer;


export function getSocketId(id : string) {
    return onlineUser[id]
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
                onlineUser[message.userId] = socket


                let onlineUserList = Object.keys(onlineUser)

                for(let userId  in onlineUser) {

                    const clientSocket = onlineUser[userId]

                    

                    if(clientSocket.readyState === WebSocket.OPEN) {
                        clientSocket.send(JSON.stringify({
                            type : 'online-users',
                            users : onlineUserList
                        }))
                    }
                }
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




