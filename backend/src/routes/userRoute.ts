import { Router } from "express";
import { getOnlineUser } from "../controllers/userController";
import authMid from "../utils/middlewares/authMid";

const route = Router()

route.get("/", authMid,  getOnlineUser)


export default route