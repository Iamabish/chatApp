import {createBrowserRouter} from "react-router-dom"
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import AuthLayout from "./layouts/AuthLayout"
import MainLayout from "./layouts/MainLayout"
import HomePage from "./pages/HomePage"
import Chat from "./components/Chat"
import ProtectedRoute from "./components/ProtectedRoute"
import Profile from "./components/Profie"
import EmptyChat from "./components/EmptyChat"



const router = createBrowserRouter([,


    {
        path: '/',
        element: <MainLayout />,
        children: [

            {
                element : <ProtectedRoute />,
                children : [
                    {
                        path: '/',
                        element: <HomePage />, 
                        children: [
                   
                            {
                                index: true,
                                element: <EmptyChat /> 
                            },
                            {
                                path: 'chat/:id',
                                element: <Chat />  
                            },

                            {
                                path : 'profile/:id',
                                element : <Profile />
                            }
                        ]
                },

                ]
            },
            
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