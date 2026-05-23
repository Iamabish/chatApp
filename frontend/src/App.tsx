import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./Router";
import {Toaster }from "sonner"
import { useSession } from "./lib/auth.client";
import { useSocketStore } from "./store/socket/useSocket";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

    const queryClient = new QueryClient()


const App = () => {

   const {data} = useSession()
    const user = data?.user
    console.log(data);



    const { connect } = useSocketStore()

    console.log(user?.id);
    

  useEffect(() => {

    if(!user?.id) return

      connect(user.id)
  }, [user?.id])




  return (
   <>
   <QueryClientProvider client={queryClient}>
        <Toaster position="bottom-right"/>
        <RouterProvider  router={router}/>
      </QueryClientProvider>
   </>
  )
}

export default App 