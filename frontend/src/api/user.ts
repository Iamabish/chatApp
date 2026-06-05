import axiosInstance from "@/lib/axios";
const BASE_URL='/user'

export const getSideBarRoom = async () => {
    console.log('at side bar room caller ');
    const res = await axiosInstance.get(`${BASE_URL}/room`)
    return res.data
}


export const getMe= async () => {
    const res = await axiosInstance.get(`${BASE_URL}/me`)
    return res.data
}


export const getSideBarUser = async (pageParam : number) => {
    const res = await axiosInstance.get(`${BASE_URL}?page=${pageParam}`)
    return res.data
}

export const getSingleUser = async (id : string) => {
    const res = await axiosInstance.get(`${BASE_URL}/${id}`)
    return res.data
}

export const updateProfile = async ({id, payload} : {
    id : string,
    payload : {
        name : string,
        bio : string,
        avatarUrl : string
    }
}) => {
    const res = await axiosInstance.patch(`${BASE_URL}/${id}`, payload)
    return res.data
}

export const uploadImage = async(payload : FormData) => {
    console.log('at upload image ');
    const res = await axiosInstance.post(`${BASE_URL}/upload`, payload)
    return res.data
}