import axiosInstance from "@/lib/axios";

const BASE_URL='/user'

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
    }
}) => {
    
    const res = await axiosInstance.patch(`${BASE_URL}/${id}`, payload)


    return res.data
}