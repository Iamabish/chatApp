import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../lib/db";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { getSocketId, onlineUser, wss } from "../lib/socket";
import { Prisma } from "@prisma/client";

const getMessage = asyncHandler(async (req : Request, res : Response) => {

    const {id : userToChat} = req.params

    const userid = req.user.id


   const chats = await prisma.message.findMany({
    where : {
        OR : [
            {senderId : userid, receiverId : userToChat as string},
            {senderId : userToChat as string, receiverId : userid}
        ]
    },
    include :{
        sender : {
            select : {
                userName : true,
                avatarUrl : true,
            }
        },
        receiver : {
            select : {
                userName : true,
                avatarUrl : true
            }
        }
    }
   })

   if(!chats.length) {
    throw new ApiError(400, "No Chats available")
   }

   return res.status(200).json(new ApiResponse(
    200,
    "Chats fetched successfully",
    chats,
   ))

})


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
            text : text
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
        await prisma.message.update({
            where :{
                id : message.id,
              
            },
            data :{
                hiddenForSender : true
            }
        })
    }else {
        await prisma.message.update({
            where : {
                id : message.id
            },
            data :{
                hiddenForReceiver : true,
                hiddenForSender : true
            }
        })
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

    return res.status(200).json(new ApiResponse(
        200,
        "Message edit successfully",
        message
    ))

})

export { 
    getMessage,
    createMessage,
    delteMessage,
    deleteAllMessage,
    editMessage
}