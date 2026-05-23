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













export { 
    getMessage,
    createMessage,
}