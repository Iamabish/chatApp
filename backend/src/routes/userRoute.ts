import { Router } from "express";
import { getOnlineUser, getProfile, updateProfile } from "../controllers/userController";
import authMid from "../utils/middlewares/authMid";
import { upload } from "../utils/middlewares/uploadMiddelware"

const route = Router()

route.get("/", authMid,  getOnlineUser)
route.get("/:id", authMid,  getProfile)
route.patch("/:id", authMid,  updateProfile)
route.post("/upload", authMid, upload.single('image'),  updateProfile)

export default route