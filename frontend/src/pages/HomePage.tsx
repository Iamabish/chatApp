import Sidebar from "@/components/Sidebar"
import { Outlet } from "react-router";


const HomePage = () => {

    console.log('Home page  rendered ');

 
  return (
    <div className="flex">

      <Sidebar />
      <div className="flex-1">
        <Outlet />
      </div>

    </div>
  )
}

export default HomePage