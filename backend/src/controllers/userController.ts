import prisma from "../lib/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Request, Response } from "express";
import { uploadCloudinary } from "../utils/cloudinary.js";




const getUserJoinedRoom = asyncHandler(async (req: Request, res: Response) => {

    console.log("check at user joined room");

    const userId = req.user.id;

    console.log(userId);

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    
    const userRooms = await prisma.room.findMany({
        where: {
            member: {
                some: { id: userId }
            },
            
        },
        select :{
            slug : true,
            id : true,
            avatarUrl : true
        },
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' }
    })

    console.log('user rooms', userRooms);
    

    const total = await prisma.room.count({
        where: { member: { some: { id: userId } } }
    })

    const total_pages = Math.ceil(total / limitNumber)

    return res.status(200).json(new ApiResponse(200, "User join room  fetched successfully", {
        data: userRooms,
        currPage: pageNumber,
        total,
        total_pages
    }))
  
});

const getMe = asyncHandler(async (req: Request, res: Response) => {

    const userId = req.user.id;

    const me = await prisma.user.findUnique({
        where :{
            id : userId
        },
        select :{
            userName : true,
            name : true,
            image : true,
            avatarUrl : true,
            email : true,
            bio : true,
        }
    })


    if(!me) {
        throw new ApiError(400, "Invalid user")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Logged user  fetched successfully",
            me
        )
    );
});

const getSidebarUser = asyncHandler(async (req: Request, res: Response) => {

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


const getProfile = asyncHandler(async (req : Request, res : Response) => {
    const { id } = req.params

    const user = await prisma.user.findUnique({where :{id : id as string},
    select : {
        userName : true,
        avatarUrl : true,
        image : true,
        name : true,
        email : true,
        bio : true
    }
}
        
    )

    if(!user) {
        throw new ApiError(400, 'Invalid  user')
    }


     return res.status(200).json(
        new ApiResponse(
            200,
            "Profile fetched successfully",
            user
        )
    );
})


const updateProfile = asyncHandler(async (req : Request, res : Response) => {

    const { id } = req.params
    
    const { name, userName, bio,  avatarUrl } = req.body
    const user = await prisma.user.findUnique({where :{id : id as string}})

    if(!user) {
        throw new ApiError(400, 'Invalid  user')
    }

    const updatedUser = await prisma.user.update({
        where : {
            id : id as string,
        },
        data : {
            name : name,
            userName : userName,
            bio : bio,
            avatarUrl : avatarUrl
        },
        select : {
            userName : true,
            avatarUrl : true,
            image : true,
            name : true,
            email : true,
            bio : true,
        }
    })


     return res.status(200).json(
        new ApiResponse(
            200,
            "Profile Updated successfully",
            updatedUser
        )
    );
})

const  uploadImage = asyncHandler( async (req: Request, res: Response) => {
        try {
                
            console.log("req at upload image ");

            

            const file = req.file;

            if (!file) {
            throw new ApiError(400, "No file provided");
            }

            const imageUrl = await uploadCloudinary(file.path);

            console.log("updated imageUrl", imageUrl?.secure_url);

            return res.status(200).json(
                new ApiResponse(200, "Image uploaded successfully", {
                    url: imageUrl?.secure_url,
                })
            );


    } catch (err) {
        console.log("server error", err);

        throw new ApiError(500, "Something went wrong");
    }
}) 




export {
    getUserJoinedRoom,
    getSidebarUser,
    getProfile,
    updateProfile,
    uploadImage,
    getMe
}