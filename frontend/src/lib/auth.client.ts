import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"

const authClient = createAuthClient({
    baseURL: "https://chatapp-dez0.onrender.com",
    
    plugins : [usernameClient()]
})

export const {useSession, signIn, signOut, signUp} = authClient
export default authClient



