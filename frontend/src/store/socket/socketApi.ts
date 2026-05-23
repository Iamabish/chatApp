import axiosInstance from "@/lib/axios"

export const sendMessage = async ({
  receiverId,
  payload,
}: {
  receiverId: string
  payload: string
}) => {

  const res = await axiosInstance.post(
    `/message/${receiverId}`,
    {
      text: payload,
    }
  )

  return res.data
}