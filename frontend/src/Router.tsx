import {createBrowserRouter} from "react-router-dom"
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import AuthLayout from "./layouts/AuthLayout"
import HomePage from "./pages/HomePage"
import Chat from "./components/Chat"
import ProtectedRoute from "./components/ProtectedRoute"
import Profile from "./components/Profie"
import AuthProtectdRoute from "./components/AuthProtectdRoute"
import CreateRoom from "./components/CreateRoom"
import Room from "./components/Room"
import RoomInfo from "./components/RoomInfo"
import NoChat from "./components/NoChat"

const router = createBrowserRouter([
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/',
                element: <HomePage />,
                children: [
                    { index: true, element: <NoChat /> },
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
                element: <Room />  
            },
            {
                path: '/room-info/:id',
                element: <RoomInfo />  
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