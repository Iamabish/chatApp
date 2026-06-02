import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import prisma from "../lib/db.js"
import { ApiError } from "../utils/ApiError.js"
import { onlineUser } from "../lib/socket.js"
import { uploadCloudinary } from "../utils/cloudinary.js"

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
        },
        select :{
            id : true,
            slug : true,
            description : true,
            avatarUrl : true,
            createdAt : true,
            updatedAt  : true,
            adminId : true,
            _count : {
                select : {member : true}
            }
        }
    })


    console.log('created', room);
    

    

     return res.status(200).json(
        new ApiResponse(
            200,
            "Room created successfully",
            room
        )
    );
})
const getroomMember = asyncHandler(async (req : Request, res : Response) => {

    const { id } = req.params

    console.log('at get room memeber', id);

    const userId = req.user?.id

    const isRoom = await prisma.room.findUnique({where : {id : id  as string}})

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
const joinRoom = asyncHandler(async (req : Request, res : Response) => {


    console.log('at user joined room ');
    
    
    const { id } = req.params

    const userId = req.user.id

    
    const isRoom = await prisma.room.findUnique({
        where : {id : id as string}
    })

    console.log('is room', isRoom);
    

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

    


    if (onlineUser[userId]) {
        onlineUser[userId].rooms.add(room.id);
    }

    const onlineInRoom = Object.keys(onlineUser).filter(uid => 
        onlineUser[uid].rooms.has(room.id) && onlineUser[uid].socket.readyState === WebSocket.OPEN
    )

    console.log('online in room at point of join ', onlineInRoom);
    
    
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

const addMemberToRoom = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params
    const { userId } = req.body

    const currentUserId = req.user.id

    const room = await prisma.room.findUnique({
      where: {
        id_adminId :{
            id : id as string,
            adminId : currentUserId
        }
      },
      select: {
        id: true,
      },
    })

    if (!room) {
        throw new ApiError(
        404,
        "Room not found"
      )
    }

    const targetUser =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

    if (!targetUser) {
      throw new ApiError(
        404,
        "User not found"
      )
    }

    const existingMember = await prisma.room.findFirst({
        where: {
            id: room.id,
            member: {
            some: {
                id: userId,
            },
            },
        },
    })

    if (existingMember) {
    throw new ApiError(
        400,
        "User is already a member of this room"
    )
    }

    await prisma.room.update({
      where: {
        id: room.id,
      },
      data: {
        member: {
          connect: {
            id: userId,
          },
        },
      },
    })

    if (onlineUser[userId]) {
        onlineUser[userId].rooms.add(room.id)
    }

    const onlineInRoom = Object.keys(
      onlineUser
    ).filter(
      (uid) =>
        onlineUser[uid].rooms.has(room.id) &&
        onlineUser[uid].socket.readyState ===
          WebSocket.OPEN
    )

    for (const uid in onlineUser) {
      const user = onlineUser[uid]

      if (
        user.rooms.has(room.id ) &&
        user.socket.readyState ===
          WebSocket.OPEN
      ) {
        user.socket.send(
          JSON.stringify({
            type: "member-added",
            roomId : room.id,
            userId,
            onlineUsers: onlineInRoom,
          })
        )
      }
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        "Member added successfully"
      )
    )
  }
)

const leaveRoom = asyncHandler(async (req : Request, res : Response) => {


    const { id } = req.params

    const userId = req.user.id




    console.log('rooomid', id);
    console.log('userid', userId);

    const isRoom = await prisma.room.findUnique({
        where : {id : id as string}
    })


    console.log('isroom', isRoom);
    

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


    if(onlineUser[userId]) {
        onlineUser[userId].rooms.delete(room.id)
    }

    const onlineInRoom = Object.keys(onlineUser).filter((uid) => 
        onlineUser[uid].rooms.has(room.id) && onlineUser[uid].socket.readyState === WebSocket.OPEN 
    )


    console.log('online in room at point of leaving ', onlineInRoom);
    

    for(const uid in onlineUser) {
        let user = onlineUser[uid]
        if(user.rooms.has(room.id) && user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(JSON.stringify({
                type : 'user-left-room',
                roomid : room.id,
                onlineUsers : onlineInRoom
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
    
        if( uid !== userId &&   user.rooms.has(isRoom.id) && user.socket.readyState === WebSocket.OPEN) {
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

const editRoomMessage = asyncHandler(async (req : Request, res : Response) => { 

    const { id  } = req.params

    const { text, data, messageId } = req.body

    const userId = req.user.id

    const isMessage = await prisma.message.findFirst({
        where :{
            id : messageId,
            senderId : userId,
            roomId : id as string
        }
    })

    if(!isMessage) {
        throw new ApiError(400, "Unauthorized operation")
    }

    const updateMessage = await prisma.message.update({
        where : {
            id : isMessage.id
        },
        data : {
            text : text,
            data : data
        }
    })


     for(const uid in onlineUser) {
        const user = onlineUser[uid]

        if(user.rooms.has(id as string) && user.socket.readyState === WebSocket.OPEN){
            user.socket.send(JSON.stringify({
                type : 'edit-message-send',
                userId : userId,
                roomId: isMessage.roomId,
                payload : updateMessage
            }))
        }
     }

    return res.status(200).json(new ApiResponse(
        200,
        "Message edit successfully",
        updateMessage
    ))

})

const deleteRoomMessage = asyncHandler(async (req: Request, res: Response) => {

        const { id } = req.params
        const {  payload } = req.body
        const { messageId , flag} = payload
        const userId = req.user.id

        const isMessage = await prisma.message.findFirst({
            where: {
                id: messageId,
                roomId: id as string, 
            }
        })
    

    if (!isMessage) {
        throw new ApiError(400, "Invalid operation")
    }

    if (isMessage.hiddenForIds.includes(userId)) {
        throw new ApiError(400, "Message already hidden")
    }


    if (flag === "me") {

        await prisma.message.update({
        where: {
            id: isMessage.id,
        },
        data: {
            hiddenForIds: {
            push: userId
            }
        }
        })

    } else {

        if (isMessage.senderId !== userId) {
        throw new ApiError(403, "Unauthorized")
        }

        const message = await prisma.message.update({
            where: {
                id: messageId,
            },
            data: {
                hiddenForEveryone: true
            }
        })

        for (const uid in onlineUser) {

        const user = onlineUser[uid]

        if (
            user.rooms.has(id as string) &&
            user.socket.readyState === WebSocket.OPEN
        ) {
            user.socket.send(JSON.stringify({
            type: "room-message-delete",
            userId,
            roomId : id as string,
            messageId: message.id
            }))
        }
        }
    }

    return res.status(200).json(
        new ApiResponse(
        200,
        "Message deleted successfully",
        )
    )
})

const getRoomMessage = asyncHandler(
    async (req: Request, res: Response) => {
    
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

const getRooms = asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 10 , search  } = req.query
        const pageNumber = Number(page)
        const limitNumber = Number(limit)

        const skip = (pageNumber - 1) * limitNumber

        const searchTerm = search as string
        
        const whereRoom : any = {}

        if(search) {
            whereRoom.OR = [
                {
                    slug :{
                        contains : searchTerm,
                        mode : "insensitive"
                    }
                },


                {
                    description : {
                        contains : searchTerm,
                        mode : "insensitive"
                    }
                }
            ]
        }

        const rooms = await prisma.room.findMany({
            where : whereRoom,
            skip,
            take : limitNumber,
            orderBy : {createdAt : "desc"},
            select : {
                slug : true,
                description : true,
                id : true,
                _count : {select :{member : true}} 
            }

        })
        const total = await prisma.room.count({
            where: whereRoom,
        })

        const total_pages = Math.ceil(
        total / limitNumber
        )
        
        return res.status(200).json(
            new ApiResponse(
            200,
            "Rooms fetched successfully",
            {
                currPage: pageNumber,
                total,
                total_pages,
                data: rooms,
            }
        )
        )
    }
)

const  uploadFileRoom  = asyncHandler( async (req: Request, res: Response) => {
    try {
                
        const file = req.file;

        if (!file) {
            throw new ApiError(400, "No file provided");
        }

        const imageUrl = await uploadCloudinary(file.path);


         return res.status(200).json(
            new ApiResponse(200, "File  uploaded successfully", {
                    url: imageUrl?.secure_url,
            })
        );

    } catch (err) {
        console.log("server error", err);

        throw new ApiError(500, "Something went wrong");
    }
}) 


const inviteUsers = asyncHandler(async (req: Request, res: Response) => {

    const { search = "", page = 1, limit = 10 } = req.query
    const { id } = req.params

    const userId = req.user.id

    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    const skip = (pageNumber - 1) * limitNumber

    const searchTerm = String(search)

    const room = await prisma.room.findUnique({
      where: {
        id_adminId: {
          id: id as string,
          adminId: userId,
        },
      },
      select: {
        member: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!room) {
      throw new ApiError(
        404,
        "Room not found or unauthorized"
      )
    }

    const memberIds = room.member.map(
      (member) => member.id
    )

    const whereClause: any = {
      id: {
        notIn: memberIds,
      },
    }

    if (searchTerm.trim()) {
      whereClause.OR = [
        {
          userName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ]
    }

    const total = await prisma.user.count({
      where: whereClause,
    })

    const users = await prisma.user.findMany({
      where: whereClause,

      select: {
        id: true,
        userName: true,
        name: true,
        avatarUrl: true,
        image: true,
      },

      skip,
      take: limitNumber,

      orderBy: {
        createdAt: "desc",
      },
    })

    const total_pages = Math.ceil(
      total / limitNumber
    )

    return res.status(200).json(
      new ApiResponse(
        200,
        "Users fetched successfully",
        {
          currPage: pageNumber,
          total,
          total_pages,
          data: users,
        }
      )
    )
  }
)

const removeRoomMember = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const adminId = req.user.id

    const { userId } = req.body

    const room = await prisma.room.findUnique({
      where: {
        id_adminId :{
            id : id as string,
            adminId : adminId
        }
      },
      select: {
        id: true,
        adminId: true,
        member: {
          where: {
            id: userId ,
          },
          select: {
            id: true,
          },
        },
      },
    })

    if (!room) {
      throw new ApiError(404, "Room not found")
    }

    if (room.member.length === 0) {
      throw new ApiError(
        400,
        "User is not a member of this room"
      )
    }

    await prisma.room.update({
      where: {
        id: room.id,
      },
      data: {
        member: {
          disconnect: {
            id: userId ,
          },
        },
      },
    })

    
    const onlineInRoom = Object.keys(
      onlineUser
    ).filter(
      (uid) =>
        onlineUser[uid].rooms.has(room.id ) &&
        onlineUser[uid].socket.readyState ===
          WebSocket.OPEN
    )

    for (const uid in onlineUser) {
      const user = onlineUser[uid]

      if (
        user.rooms.has(room.id ) &&
        user.socket.readyState ===
          WebSocket.OPEN
      ) {
        user.socket.send(
          JSON.stringify({
            type: "member-removed",
            roomId : room.id,
            userId,
            onlineUsers: onlineInRoom,
          })
        )
      }
    }

    if (onlineUser[userId]) {
      onlineUser[userId].rooms.delete(room.id )
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        "Member removed successfully"
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
    deleteRoomMessage,
    getroomMember,
    getRoomMessage,
    editRoomMessage,
    getRooms,
    uploadFileRoom,
    inviteUsers,
    addMemberToRoom,
    removeRoomMember
}