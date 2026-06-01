import { NextFunction, Request, Response } from "express";
import { auth } from "../../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { ApiError } from "../ApiError.js";
import prisma from "../../lib/db.js";

export default async function authMid(req : Request, res : Response, next : NextFunction) {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });


    if(!session || !session.user) {
        throw new ApiError(400, 'Unauthorized user')
    }

    const user = await prisma.user.findUnique({
        where : {id : session.user.id}
    })

    req.user = {
        id : session.user.id,
        email : session.user.email,
        userName : user?.userName!,
        role : user?.role!,
        name : user?.name!
    }
    next()
}