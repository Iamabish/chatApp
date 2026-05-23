import axiosInstance from "@/lib/axios"

const BASE_URL = "/message"

export const getMessages = async (
  receiverId: string,
  pageParam: number
) => {

  const res = await axiosInstance.get(
    `${BASE_URL}/${receiverId}?page=${pageParam}`
  )

  return res.data
}


export const createMessage = async (
    id: string,
    payload: {
        text: string
    }
) => {

    const res = await axiosInstance.post(
        `${BASE_URL}/${id}`,
        payload
    )

    return res.data
}