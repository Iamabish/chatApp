import prisma from "../lib/db";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";


const getOnlineUser = asyncHandler(async (req: Request, res: Response) => {

    console.log("check at get online user");

    const userId = req.user.id;

    console.log(userId);

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const total = await prisma.user.count({
        where: {
            id: {
                not: userId,
            },
        },
    });

    const sideBarUser = await prisma.user.findMany({
        where: {
            id: {
                not: userId,
            },
        },

        select: {
            id : true,
            userName: true,
            image: true,
            avatarUrl: true,
        },

        skip: skip,
        take: limitNumber,

        orderBy: {
            createdAt: "desc",
        },
    });


    const total_pages = Math.ceil(total / limitNumber);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Users fetched successfully",
            {
                currPage: pageNumber,
                total,
                total_pages,
                data: sideBarUser,
            }
        )
    );
});

export {
    getOnlineUser
}