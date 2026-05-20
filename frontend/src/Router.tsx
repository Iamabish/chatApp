import {createBrowserRouter} from "react-router-dom"
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import AuthLayout from "./layouts/AuthLayout"
import MainLayout from "./layouts/MainLayout"



const router = createBrowserRouter([,


    {
        path : '/',
        element : <MainLayout />
    },

    
    {
        path : '/auth',
        element : <AuthLayout />,


        children : [
            {
                path : 'signin',
                element : <Signin />
            },


            {
                path : 'signup',
                element : <Signup />
            }
        ]
    }
])

export default router