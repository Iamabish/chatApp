import { Router } from "express"
import {
  createRoom,
  updateRoom,
  joinRoom,
  leaveRoom,
  sendMessage,
  deleteRoomMessage,
  getroomMember,
  getRoomMessage,
  editRoomMessage,
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
route.post("/message/:id", authMid, editRoomMessage)
route.delete("/message/delete/:id", authMid, deleteRoomMessage)

export default route