import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"

const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    fetchOptions: {
        credentials: "include"
    },
    plugins: [usernameClient()]
})

export const {useSession, signIn, signOut, signUp} = authClient
export default authClient



