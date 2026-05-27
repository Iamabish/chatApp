import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { ApiResponse } from "../utils/ApiResponse"
import prisma from "../lib/db"
import { StorageEngine } from "multer"
import { ApiError } from "../utils/ApiError"
import { getSocketId, onlineUser } from "../lib/socket"
import { log } from "node:console"
//2oo
const createRoom = asyncHandler(async (req : Request, res : Response) => {


    const { slug, description, avatarUrl} = req.body

    const userId = req.user.id


    const room = await prisma.room.create({
        data :{
            slug: slug,
            description : description,
            adminId : userId,
            avatarUrl : avatarUrl,
            member : {
                connect : {
                    id : userId
                }
            }
        }
    })

     return res.status(200).json(
        new ApiResponse(
            200,
            "Room created successfully",
            room
        )
    );
})

//2oo
const getroomMember = asyncHandler(async (req : Request, res : Response) => {

    const { id } = req.params

    console.log('at get room memeber', id);

    const isRoom = await prisma.room.findUnique({where : {id : id as string}})

    if(!isRoom) throw new ApiError(400, "Invalid room")
    
    const roomMember = await prisma.room.findUnique({
        where :{
            id : id as string
        },
        include :{
            member :{
                select :{
                    id : true,
                    userName : true,
                    avatarUrl : true,
                }
            }
        },
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            "Room member fetched  successfully",
            roomMember
        )
    );
})



//200
const updateRoom = asyncHandler(async (req : Request, res : Response) => {


    const { id } = req.params

    console.log('log at update room');
    

    const { slug, description, avatarUrl } = req.body

    const userId = req.user.id

    const isAdmin = await prisma.room.findUnique({
        where :{
            id_adminId :{
                id : id as string,
                adminId : userId
            }
        }
    })

    if(!isAdmin) throw new ApiError(400, "Invalid operation")

    const room = await prisma.room.update({
        where :{ 
            id : id as string,
        },
        data :{
            slug: slug,
            description : description,
            avatarUrl : avatarUrl,
        }
    })

    if(!room) throw new ApiError(400, "Failed to Update room")

     return res.status(200).json(
        new ApiResponse(
            200,
            "Room updated successfully",
            room
        )
    );
})

//200
const joinRoom = asyncHandler(async (req : Request, res : Response) => {



    const { id } = req.params

    const userId = req.user.id

    const isRoom = await prisma.room.findUnique({
        where : {id : id as string}
    })

    if(!isRoom) {
        throw new ApiError(400, "Inavlid room")
    }

    const room = await prisma.room.update({
        where :{
            id : isRoom.id
        },
        data : {
            member : {
                connect :{
                    id : userId
                }
            }
        }
    })


    onlineUser[userId].rooms.add(room.id)

    const onlineInRoom = Object.keys(onlineUser).filter(uid => 
        onlineUser[uid].rooms.has(room.id) && onlineUser[uid].socket.readyState === WebSocket.OPEN
    )

    console.log('online in room', onlineInRoom);
    

    for(const uid in onlineUser) {

        

        let user = onlineUser[uid]

    
        if(user.rooms.has(room.id) && user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(JSON.stringify({
                type : 'user-joined-room',
                roomId : room.id,
                userId : userId,
                onlineUsers : onlineInRoom
            }))
        }
    }

    

     return res.status(200).json(
        new ApiResponse(
            200,
            "Room joined  successfully",
        )
    );
})


const leaveRoom = asyncHandler(async (req : Request, res : Response) => {


    const { id } = req.params

    const userId = req.user.id

    const isRoom = await prisma.room.findUnique({
        where : {id : id as string}
    })

    if(!isRoom) {
        throw new ApiError(400, "Inavlid room")
    }

    const room = await prisma.room.update({
        where :{
            id : isRoom.id
        },
        data : {
           member :{
            disconnect :{
                id : userId
            }
           }
        }
    })


    onlineUser[userId].rooms.delete(room.id)


    for(const uid in onlineUser) {
        let user = onlineUser[uid]
        if(user.rooms.has(room.id) && user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(JSON.stringify({
                type : 'user-left-room',
                roomid : room.id,
                userId : userId
            }))
        }
    }

    

     return res.status(200).json(
        new ApiResponse(
            200,
            "Room Left  successfully",
            
        )
    );
})

const sendMessage  = asyncHandler(async (req : Request, res : Response) => {


    const { id } = req.params

    console.log('at send message room');
    

    const { text, data } = req.body

    const userId = req.user.id

    const isRoom = await prisma.room.findUnique({
        where : {id : id as string}
    })

    if(!isRoom) {
        throw new ApiError(400, "Inavlid room")
    }

    const message = await prisma.message.create({
        data :{
            senderId : userId,
            roomId : id as string,
            text : text,
            data : data,
        },
        include :{
            sender :{
                select :{
                    userName : true,
                    avatarUrl : true
                }
            }
        }
    })


    console.log('message', message);
    
    for(const uid in onlineUser) {

        const user = onlineUser[uid]
    
        if(user.rooms.has(isRoom.id) && user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(JSON.stringify({
                type : 'room-message-send',
                userId : userId,
                roomId: isRoom.id,
                payload : message
            }))
        }
    }

     return res.status(200).json(
        new ApiResponse(
            200,
            "Message sent successfully",
            message
        )
    );
})

const deleteMessage  = asyncHandler(async (req : Request, res : Response) => {


    const { id } = req.params

    const { flag } = req.body

    const userId = req.user.id

    const isMessage = await prisma.message.findUnique({where : {id : id as string}})

    if(!isMessage) throw new ApiError(400, 'Invalid operation')

    if(isMessage.hiddenForIds.includes(userId)) return;


    const roomId = isMessage.roomId

   
    if(flag === "me") {

       await prisma.message.update({
        where :{id : isMessage.id},
        data :{
            hiddenForIds : {
                push : userId
            }
        }
       })

    }else {
       const message =  await prisma.message.update({
            where : {
                id : id as string,
            },
            data :{
                hiddenForEveryone : true
            }
        })

        for(const uid in onlineUser) {
            const user = onlineUser[uid]
            if(user.rooms.has(roomId!) && user.socket.readyState === WebSocket.OPEN) {
                user.socket.send(JSON.stringify({
                    type : 'room-message-delete',
                    userId : userId,
                    roomId: roomId,
                    messageId : message.id
                }))
            }
        }
    }

     return res.status(200).json(
        new ApiResponse(
            200,
            "Message Delete successfully",
        )
    );
})



const getRoomMessage = asyncHandler(
    async (req: Request, res: Response) => {


        console.log('at get room message');
        

        const { id } = req.params

        const { page = 1, limit = 10 } = req.query

        const pageNumber = Number(page)

        const limitNumber = Number(limit)

        const skip = (pageNumber - 1) * limitNumber

        const userId = req.user.id

        console.log('userid', userId);
        

        const isRoom =
        await prisma.room.findUnique({
            where: {
            id: id as string,
            },
        })


        if (!isRoom) {
            throw new ApiError(400,"Invalid room")
        }

        console.log('is room',isRoom);
        

        const total = await prisma.message.count({
            where: {
            roomId: isRoom.id,
            hiddenForEveryone: false,
            NOT :{
                hiddenForIds : {
                    has : userId
                }
            }
        
            },
        })

        log('total', total)

        const message = await prisma.message.findMany({
            where: {
                roomId: isRoom.id,
                hiddenForEveryone: false,
                AND : [
                    {

                        NOT: {
                            hiddenForIds: {
                            has: userId,
                            },
                        },
                    }
                    
                ]
                
            },
            
            select :{
                id : true,
                text : true,
                data : true,
                createdAt : true,
                updatedAt : true,
                senderId : true,
                     
                sender: {
                    select: {
                    userName: true,
                    avatarUrl: true,
                    },
                },
            },


            skip,

            take: limitNumber,

            orderBy: {
                 createdAt: "desc",
            },
        })


        console.log('message at get room message', message);
        

        const total_pages = Math.ceil(total / limitNumber)

        return res.status(200).json(
        new ApiResponse(
            200,
            "Message Fetched successfully",
            {
                currPage: pageNumber,
                data: message,
                total,
                total_pages,
            }
        )
        )
    }
)

export {
    createRoom,
    updateRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    deleteMessage,
    getroomMember,
    getRoomMessage
}