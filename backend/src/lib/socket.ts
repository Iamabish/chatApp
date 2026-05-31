import { string, uuid } from "better-auth"
import { WebSocketServer, WebSocket } from "ws"
import prisma from "./db"
import { Socket } from "node:dgram"

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
        

        socket.on("message", async (data) => {

            console.log('message handler on socket backend');
            

            let message = JSON.parse(data.toString())


            console.log('message', message);
            

            if(message.type === "join") {

                const { userId } = message


                const userRooms = await prisma.room.findMany({
                    where :{
                        member : {
                            some : {
                                id : userId
                             }
                        }
                    },
                    select : {id : true }
                })

                const roomIds = new Set(userRooms.map(r => r.id))

                onlineUser[userId] = {
                    socket,
                    rooms : roomIds
                }


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


                for(const roomId of roomIds) {
                    const onlineInRoom = Object.keys(onlineUser).filter(uid => 
                        onlineUser[uid].rooms.has(roomId) && 
                        onlineUser[uid].socket.readyState === WebSocket.OPEN
                    )

                    socket.send(JSON.stringify({
                        type: "room-online-sync",
                        roomId,
                        onlineUsers : onlineInRoom
                    }))
                }
            }


            if(message.type === "typing") {
                const { userId,userName,  roomId } = message

        
                
                
                

                for(const uid in onlineUser) {

                    
                    if(uid !== userId &&   
                        onlineUser[uid].rooms.has(roomId) && 
                        onlineUser[uid].socket.readyState === WebSocket.OPEN) 
                        {
                            onlineUser[uid].socket.send(JSON.stringify({
                                type : 'typing',
                                userName,
                                userId,
                                roomId
                            }))
                        }
                }

            }   
            


            if(message.type === "stopped-typing") {
                const { userId, userName, roomId }  = message

            
                

                for(const uid in onlineUser) {

                    if(uid !== userId && onlineUser[uid].rooms.has(roomId) && 
                       onlineUser[uid].socket.readyState === WebSocket.OPEN) 
                       {
                            onlineUser[uid].socket.send(JSON.stringify({
                                type : 'stopped-typing',
                                userName,
                                userId,
                                roomId
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




