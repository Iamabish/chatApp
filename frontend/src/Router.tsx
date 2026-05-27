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
import AuthProtectdRoute from "./components/AuthProtectdRoute"
import CreateRoom from "./components/CreateRoom"
import RoomPage from "./components/RoomPage"



const router = createBrowserRouter([,


    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/',
                element: <HomePage />,
                children: [
                    { index: true, element: <EmptyChat /> },
                    { path: 'chat/:id', element: <Chat /> },
                    { path: 'profile/:id', element: <Profile /> },
                ]
            },
            {
                path: '/create-room',
                element: <CreateRoom />
            },
            {
                path: '/room/:id',
                element: <RoomPage />  
            }
        ]
    },
    
    {
        path : '/auth',
        element : <AuthLayout />,
        
        children : [
           {
            element : <AuthProtectdRoute />,
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
        ]
    }
])

export default router