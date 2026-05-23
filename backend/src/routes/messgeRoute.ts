import { Router } from "express";
import { createMessage, getMessage } from "../controllers/messageController";
import authMid from "../utils/middlewares/authMid";

const route = Router()

console.log('at route level');

route.get('/:id',authMid, getMessage)
route.post('/:id',authMid, createMessage)


export default route