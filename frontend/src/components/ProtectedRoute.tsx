import { useSession } from "@/lib/auth.client"
import { Navigate, Outlet } from "react-router"
import AuthLoader from "./loaders/AuthLoader"

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