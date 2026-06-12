import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import prisma from "../lib/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {  getSocketId, onlineUser, wss } from "../lib/socket.js";
import { Prisma } from "@prisma/client";
import { uploadCloudinary } from "../utils/cloudinary.js";

const getMessage = asyncHandler(async (req: Request, res: Response) => {

    console.log('req is coming here at get message ');
    

        const { id: userToChat } = req.params

        const { page = 1, limit = 10 } = req.query

        const pageNumber = Number(page)
        const limitNumber = Number(limit)

        const skip = (pageNumber - 1) * limitNumber

        const userId = req.user.id

        const total = await prisma.message.count({
        where: {
            OR: [
            {
                senderId: userId,
                receiverId: userToChat as string,
                hiddenForSender: false,
            },
            {
                senderId: userToChat as string,
                receiverId: userId,
                hiddenForReceiver: false,
            },
            ],
        },
        })

        const chats = await prisma.message.findMany({
        where: {
            OR: [
            {
                senderId: userId,
                receiverId: userToChat as string,
                hiddenForSender: false,
            },
            {
                senderId: userToChat as string,
                receiverId: userId,
                hiddenForReceiver: false,
            },
            ],
        },

        include: {
            sender: {
            select: {
                userName: true,
                avatarUrl: true,
            },
            },
            receiver: {
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

        const total_pages = Math.ceil(
        total / limitNumber
        )

        return res.status(200).json(
        new ApiResponse(
            200,
            "Chats fetched successfully",
            {
            currPage: pageNumber,
            data: chats,
            total,
            total_pages,
            }
        )
        )
    }
)


const createMessage = asyncHandler(async (req : Request, res : Response) => {

    const { id : userToSend } = req.params


    console.log('user to send', userToSend);
    

    console.log('user', req.user);
    

    const userid = req.user.id
    console.log(userid);
    

    const { text, data } = req.body;


    console.log('payload data', text);
    

   const message = await prisma.message.create({
        data : {
            senderId : userid,
            receiverId : userToSend as string,
            text : text,
            data : data
        },
        include : {
            sender: { select: { userName: true, avatarUrl: true } },
            receiver: { select: { userName: true, avatarUrl: true } }
        }
   })

   console.log('this is the message', message);
   
   let receiverSocketId = getSocketId(userToSend as string)

   if(receiverSocketId) {
        receiverSocketId.send(JSON.stringify({
            type : 'new-message',
            text : text,
            senderId : userid,
            
        }))
   }

   return res.status(200).json(new ApiResponse(
    200,
    "Message sent  successfully",
    message
   ))
})



const delteMessage = asyncHandler(async (req : Request, res : Response) => {

    console.log('check at delete message');
    

    const { id  } = req.params

    const { flag } = req.body

    console.log('user', req.user);
    

    const userId = req.user.id
    console.log(userId);


    const message = await prisma.message.findFirst({
      where: {
        id: id as string,
        senderId: userId,
      },
    })

    if (!message) {
      throw new ApiError(
        403,
        "Unauthorized operation"
      )
    }


    if(flag === "me") {

        console.log('in me blog');
        

         await prisma.message.update({
            where :{
                id : message.id,
              
            },
            data :{
                hiddenForSender : true
            }
        })




    }else {
        console.log('in everyone  blog');


        await prisma.message.update({
            where : {
                id : message.id
            },
            data :{
                hiddenForReceiver : true,
                hiddenForSender : true
            }
        })


        const receiverSocketId = getSocketId(message.receiverId as string)

        console.log('receiver socket id ', receiverSocketId);
        

        receiverSocketId.send(JSON.stringify({
            type : 'delete-message',
            messageId : id,
            senderId : userId,
        }))
    }
   

   return res.status(200).json(new ApiResponse(
    200,
    "Message delete  successfully",
    {success : true}
   ))
})


const deleteAllMessage = asyncHandler(async (req : Request, res : Response) => {

    console.log('check at delet all  message');
    

    const { id : receiverId  } = req.params

    const { flag } = req.body

    console.log('user', req.user);
    

    const userId = req.user.id

     const sentMessages = {
      senderId: userId,
      receiverId: receiverId as string,
    }

    const receivedMessages = {
      senderId: receiverId as string,
      receiverId: userId,
    }

    
    if(flag === "me") {
        await prisma.message.updateMany({
           where : sentMessages,
           data : {
            hiddenForSender : true
           }
        })


        await prisma.message.updateMany({
            where : receivedMessages,
            data : {
                hiddenForReceiver : true
            }
        })

    }else {
        await prisma.message.updateMany({
            where :{
                OR : [
                   sentMessages,
                   receivedMessages
                ]
            },
            data :{
                hiddenForSender : true,
                hiddenForReceiver : true
            }
        })


        const receiverSocketId = getSocketId(receiverId as string)

        if(receiverSocketId) {
            receiverSocketId.send(JSON.stringify({
                type : 'delete-all-message',
                senderId : userId,
            }))
        }

     
    }
    

   return res.status(200).json(new ApiResponse(
    200,
    "Chat cleared  successfully",
    {success : true}
   ))
})


const editMessage = asyncHandler(async (req : Request, res : Response) => { 

    console.log('check at edit  message');
    

    const { id  } = req.params

    const { text, data } = req.body

    console.log('user', req.user);
    

    const userid = req.user.id
    console.log(userid);

    const isMessage = await prisma.message.findFirst({
        where :{
            id : id as string,
            senderId : userid
        }
    })

    if(!isMessage) {
        throw new ApiError(400, "Unauthorized operation")
    }

    const message = await prisma.message.update({
        where : {
            id : isMessage.id
        },
        data : {
            text : text,
            data : data
        }
    })


     const receiverSocketId = getSocketId(message.receiverId as string)

     if(receiverSocketId) {
          receiverSocketId.send(JSON.stringify({
            type : 'edit-message',
            senderId : userid,
            data : message
        }))
     }

      

    return res.status(200).json(new ApiResponse(
        200,
        "Message edit successfully",
        message
    ))

})


const  uploadFile  = asyncHandler( async (req: Request, res: Response) => {
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



 


export { 
    getMessage,
    createMessage,
    delteMessage,
    deleteAllMessage,
    editMessage,
    uploadFile
}