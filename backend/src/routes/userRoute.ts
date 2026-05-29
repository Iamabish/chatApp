import { Router } from "express";
import {  getProfile, getSidebarUser, getUserJoinedRoom, updateProfile, uploadImage } from "../controllers/userController";
import authMid from "../utils/middlewares/authMid";
import { upload } from "../utils/middlewares/uploadMiddelware"

const route = Router()

route.get("/", authMid,  getSidebarUser)
route.get("/room", authMid,  getUserJoinedRoom)
route.get("/:id", authMid,  getProfile)
route.patch("/:id", authMid,  updateProfile)
route.post("/upload", authMid, upload.single('image'),  uploadImage)

export default route