import { useSession } from "@/lib/auth.client"
import { Navigate, Outlet } from "react-router"

const AuthProtectdRoute = () => {

    const { data, isPending  } = useSession()


    if(isPending) return null;

    if(data?.user) return <Navigate to={'/'} replace/>


    return <Outlet />

  
}

export default AuthProtectdRoute