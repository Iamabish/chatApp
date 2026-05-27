import { Router } from "express"
import {
  createRoom,
  updateRoom,
  joinRoom,
  leaveRoom,
  sendMessage,
  deleteMessage,
  getroomMember,
  getRoomMessage,
} from "../controllers/roomController"
import authMid from "../utils/middlewares/authMid"


const route = Router()

route.get("/member/:id", authMid, getroomMember)
route.get("/chats/:id", authMid, getRoomMessage)
route.post("/create", authMid, createRoom)
route.put("/update/:id", authMid, updateRoom)
route.post("/join/:id", authMid, joinRoom)
route.post("/leave/:id", authMid, leaveRoom)
route.post("/message/send/:id", authMid, sendMessage)
route.delete("/message/delete/:id", authMid, deleteMessage)

export default route