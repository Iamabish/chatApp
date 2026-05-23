import {createBrowserRouter} from "react-router-dom"
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import AuthLayout from "./layouts/AuthLayout"
import MainLayout from "./layouts/MainLayout"
import HomePage from "./pages/HomePage"
import Chat from "./components/Chat"



const router = createBrowserRouter([,


    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                path: '/',
                element: <HomePage />, 
                children: [
                    {
                        index: true,
                        element: null  
                    },
                    {
                        path: 'chat/:id',
                        element: <Chat />  
                    }
                ]
            }
        ]
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