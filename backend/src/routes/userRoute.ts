import { Router } from "express";
import {  getProfile, getSidebarUser, getUserJoinedRoom, updateProfile, uploadImage } from "../controllers/userController.js";
import authMid from "../utils/middlewares/authMid.js";
import { upload } from "../utils/middlewares/uploadMiddelware.js"

const route = Router()

route.get("/", authMid,  getSidebarUser)
route.get("/room", authMid,  getUserJoinedRoom)
route.get("/:id", authMid,  getProfile)
route.patch("/:id", authMid,  updateProfile)
route.post("/upload", authMid, upload.single('image'),  uploadImage)

export default route