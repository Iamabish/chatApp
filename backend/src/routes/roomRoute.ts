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
  getRooms,
  uploadFileRoom,
  inviteUsers,
  addMemberToRoom,
  removeRoomMember,
  singleRoom
} from "../controllers/roomController.js"
import authMid from "../utils/middlewares/authMid.js"
import { upload } from "../utils/middlewares/uploadMiddelware.js"

const route = Router()

route.get("/", authMid, getRooms)
route.get("/:id", authMid, singleRoom)
route.post('/upload',authMid,upload.single('file'), uploadFileRoom)
route.get("/member/:id", authMid, getroomMember)
route.get("/invite/:id", authMid, inviteUsers)
route.get("/chats/:id", authMid, getRoomMessage)
route.post("/create", authMid, createRoom)
route.put("/update/:id", authMid, updateRoom)
route.post("/join/:id", authMid, joinRoom)
route.post("/member/:id", authMid, addMemberToRoom)
route.post("/leave/:id", authMid, leaveRoom)
route.post("/message/send/:id", authMid, sendMessage)
route.post("/message/:id", authMid, editRoomMessage)
route.delete("/message/delete/:id", authMid, deleteRoomMessage)
route.patch("/member/:id",authMid,removeRoomMember)


export default route