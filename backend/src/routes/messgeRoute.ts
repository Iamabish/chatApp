import { Router } from "express";
import { createMessage, deleteAllMessage, delteMessage, editMessage, getMessage } from "../controllers/messageController";
import authMid from "../utils/middlewares/authMid";

const route = Router()

console.log('at route level');

route.get('/:id',authMid, getMessage)
route.post('/:id',authMid, createMessage)
route.put('/:id',authMid, editMessage)
route.delete('/single/:id',authMid, delteMessage)
route.delete('/all/:id',authMid, deleteAllMessage)



export default route