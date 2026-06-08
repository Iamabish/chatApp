import { createAuthClient } from "better-auth/react"

const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    fetchOptions :{
        credentials :  "include"
    }
})

export const {useSession, signIn, signOut, signUp} = authClient
export default authClient



