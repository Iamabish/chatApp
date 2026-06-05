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
        text?: string,
        data? : string
    }
) => {

    const res = await axiosInstance.post(
        `${BASE_URL}/${id}`,
        payload
    )

    return res.data
}

export const editMessage = async (
  id: string,
  payload: {
    text?: string
    data?: string
  }
) => {

  const res = await axiosInstance.put(
    `${BASE_URL}/${id}`,
    payload
  )

  return res.data
}


export const deleteMessage = async (
  id: string,
  flag: "me" | "everyone"
) => {

  const res = await axiosInstance.delete(
    `${BASE_URL}/single/${id}`,
    {
      data: {
        flag,
      },
    }
  )

  return res.data
}


export const deleteAllMessage = async (
  receiverId: string,
  flag: "me" | "everyone"
) => {

  const res = await axiosInstance.delete(
    `${BASE_URL}/all/${receiverId}`,
    {
      data: {
        flag,
      },
    }
  )

  return res.data
}

export const uploadFile = async(payload : FormData) => {
    const res = await axiosInstance.post(`${BASE_URL}/upload`, payload)

    return res.data
}