import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./ApiError.js";

const asyncHandler = (fn : any) => async (req : Request, res : Response, next : NextFunction ) => {

    try {

        await fn(req,res,next)

    }catch(err : any) {

        console.error("ERROR MESSAGE:", err.message);
        console.error("STACK TRACE:\n", err.stack);

        return res.status(err?.statusCode || 500).json({
            success : false,
            message : err?.message || 'Internal server error'
        })        
    }


}



export { asyncHandler }