import { Router } from "express";
import { createMessage, deleteAllMessage, delteMessage, editMessage, getMessage, uploadFile } from "../controllers/messageController";
import authMid from "../utils/middlewares/authMid";
import { upload } from "../utils/middlewares/uploadMiddelware";

const route = Router()

console.log('at route level');


route.get('/', authMid, )
route.get('/:id',authMid, getMessage)
route.post('/upload',authMid,upload.single('file'), uploadFile)
route.post('/:id',authMid, createMessage)
route.put('/:id',authMid, editMessage)
route.delete('/single/:id',authMid, delteMessage)
route.delete('/all/:id',authMid, deleteAllMessage)



export default route