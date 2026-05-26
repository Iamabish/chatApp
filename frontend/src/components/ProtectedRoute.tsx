import { Navigate, Outlet } from "react-router"
import AuthLoader from "./loaders/AuthLoader"
import { useSession } from "@/lib/auth.client"

const ProtectedRoute = () => {

    const { data, isPending } = useSession()

    if(isPending) return  <AuthLoader />

    if(!data) {
        return <Navigate to={'/auth/signin'} replace/>
    }

  return (
    <Outlet />
  )
}

export default ProtectedRoute