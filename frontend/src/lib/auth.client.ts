import { createAuthClient } from "better-auth/react"


const authClient = createAuthClient({
    baseURL: "http://localhost:8000" ,
})

export const {useSession, signIn, signOut, signUp} = authClient
export default authClient



