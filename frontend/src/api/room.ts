import axiosInstance from "@/lib/axios"

const BASE_URL = "/room"

export const createRoom = async (
  payload: {
    slug: string
    description?: string
  }
) => {

  const res = await axiosInstance.post(
    `${BASE_URL}/create`,
    payload
  )

  return res.data
}


export const getMessage = async (
  id: string,
  pageParam: number
) => {
  const res = await axiosInstance.get(
    `${BASE_URL}/chats/${id}?page=${pageParam}&limit=10`
  )

  return res.data
}


export const getRoomMessage = async (
  id: string,
  pageParam: number
) => {
  const res = await axiosInstance.get(
    `${BASE_URL}/chats/${id}?page=${pageParam}&limit=10`
  )

  return res.data
}

export const updateRoom = async (
  id: string,
  payload: {
    slug?: string
    description?: string
  }
) => {

  const res = await axiosInstance.put(
    `${BASE_URL}/update/${id}`,
    payload
  )

  return res.data
}

export const joinRoom = async (id: string) => {

    console.log('hit at join room api frontend ');
    

  const res = await axiosInstance.post(
    `${BASE_URL}/join/${id}`
  )

  return res.data
}


export const roomMember = async (id: string) => {

    console.log('hit at get room member  api frontend ');
    
  const res = await axiosInstance.get(
    `${BASE_URL}/member/${id}`
  )

  return res.data
}

export const leaveRoom = async (id: string) => {

  const res = await axiosInstance.post(
    `${BASE_URL}/leave/${id}`
  )

  return res.data
}

export const sendMessage = async (
  id: string,
  payload: {
    text?: string
    data?: string
  }
) => {

    console.log('at sending message');
    

  const res = await axiosInstance.post(
    `${BASE_URL}/message/send/${id}`,
    payload
  )

  return res.data
}

export const deleteMessage = async (
  id: string
) => {

  const res = await axiosInstance.delete(
    `${BASE_URL}/message/delete/${id}`
  )

  return res.data
}

