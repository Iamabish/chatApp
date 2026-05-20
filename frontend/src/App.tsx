import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./Router";
import {Toaster }from "sonner"
import { useSession } from "./lib/auth.client";

const App = () => {

   const {data} = useSession()
  
    console.log(data);

  useEffect(() => {

     const socket = new WebSocket(
      "ws://localhost:3000"
    );

    socket.onopen = () =>  {
        socket.send(JSON.stringify({
          type : 'join',
          userId : '123'
        }))


        socket.onmessage = (event) => {
          const data = JSON.parse(event.data)

          console.log(data);
          
        }
    }


    socket.onclose = () => {
      console.log('user disconnected');
      
    }


    return ()=> {
      socket.close ()
    }
  })




  return (
   <>
      <Toaster position="bottom-right"/>
      <RouterProvider  router={router}/>
   </>
  )
}

export default App 