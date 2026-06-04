import SearchModal from "@/components/SearchModal";
import Sidebar from "@/components/Sidebar"
import { useEffect, useState } from "react";
import { Outlet } from "react-router";


const HomePage = () => {

    console.log('Home page  rendered ');
    const [open, setOpen] = useState(false);

    useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform
        .toUpperCase()
        .includes("MAC");

      if (
        (isMac && e.metaKey && e.key === "k") ||
        (!isMac && e.ctrlKey && e.key === "k")
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, []);


 
  return (
    <div className="flex">
     <Sidebar onOpenSearch={() => setOpen(true)} />
      <div className="flex-1">
        <Outlet />
      </div>
      <SearchModal open={open} setOpen={setOpen} />
    </div>
  )
}

export default HomePage