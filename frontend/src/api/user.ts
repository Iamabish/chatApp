import axiosInstance from "@/lib/axios";

const BASE_URL='/user'

export const getSideBarUser = async (pageParam : number) => {
    const res = await axiosInstance.get(`${BASE_URL}?page=${pageParam}`)


    return res.data
}

