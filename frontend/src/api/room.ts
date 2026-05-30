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
    
  const res = await axiosInstance.post(
    `${BASE_URL}/join/${id}`
  )

  return res.data
}


export const roomMember = async (id: string) => {
    
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


    const res = await axiosInstance.post(
        `${BASE_URL}/message/send/${id}`,
        payload
    )

    return res.data
}


export const editRoomMessage = async (
    id: string,
    payload: {
        text?: string
        data?: string,
        messageId : string
    }
    ) => {
    const res = await axiosInstance.post(
        `${BASE_URL}/message/${id}`,
        payload
    )

    return res.data
}

export const deleteRoomMessage = async (
  id: string,
  payload :{
    messageId : string,
    flag: "me" | "everyone"
  }

) => {

    const res = await axiosInstance.delete(
        `${BASE_URL}/message/delete/${id}`,{
        data: {
            payload,
        },
        }
    )

    return res.data
}

export const searchRoom = async (
    search: string,
    pageParam: number = 1
    ) => {
    const res = await axiosInstance.get(
        `${BASE_URL}/`,
        {
        params: {
            search,
            page: pageParam,
            limit: 10,
        },
        }
    );

    return res.data;
};

export const uploadFileRoom = async(payload : FormData) => {
    const res = await axiosInstance.post(`${BASE_URL}/upload`, payload)
    return res.data
}





