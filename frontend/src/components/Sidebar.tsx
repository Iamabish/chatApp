import { getSideBarUser } from "@/api/user"
import { useInfiniteQuery } from "@tanstack/react-query"
import SidebarUser from "./SidebarUser"
import { Button } from "./ui/button"
import { Loader2, LogOut, MoreVertical, User } from "lucide-react"
import { Link, useNavigate } from "react-router"
import SidebarLoader from "./loaders/SideBarLoader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useSession, signOut } from "@/lib/auth.client"

const Sidebar = () => {

  const navigate = useNavigate()

  const { data: session } = useSession()

  const currentUser = session?.user

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["allUsers"],

    queryFn: ({ pageParam = 1 }) =>
      getSideBarUser(pageParam),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {

      const current = lastPage.data.currPage

      const total = lastPage.data.total_pages

      return current < total
        ? current + 1
        : undefined
    },

    staleTime: 1000 * 60 * 2,
  })

  const users =
    data?.pages.flatMap(
      (page) => page.data.data
    ) || []

  if (isLoading) {
    return <SidebarLoader />
  }

  return (
    <div className="flex h-screen w-[420px] flex-col border-r border-zinc-900 bg-black">

      <div className="border-b border-zinc-900 px-5 py-4 shrink-0">

        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
          Messages
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          {users.length} users
        </p>

      </div>

      <div className="flex-1 overflow-y-auto p-3">

        <div className="flex flex-col gap-2">

          {users?.map((user) => (

            <Link
              key={user.id}
              to={`/chat/${user.id}`}
            >

              <SidebarUser
                image={user.image}
                avatarUrl={user.avatarUrl}
                userName={user.userName}
                userId={user.id}
              />

            </Link>
          ))}

        </div>

        {hasNextPage && (

          <div className="mt-5 flex justify-center">

            <Button
              variant="secondary"
              className="w-full rounded-xl bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >

              {isFetchingNextPage ? (

                <span className="flex items-center gap-2">

                  <Loader2 className="h-4 w-4 animate-spin" />

                  Loading...

                </span>

              ) : (
                "Load More"
              )}

            </Button>

          </div>
        )}

        {!hasNextPage && users.length > 0 && (

          <p className="mt-5 text-center text-xs text-zinc-500">
            No more users
          </p>

        )}

      </div>

  
    <div className="shrink-0 border-t border-zinc-900 p-3">

    <DropdownMenu>

        <DropdownMenuTrigger asChild>

        <button className="flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-3 transition-colors hover:bg-zinc-900">

            <Avatar className="h-11 w-11 border border-zinc-800">

            <AvatarImage
                src={
                currentUser?.image ||
                currentUser?.avatarUrl ||
                ""
                }
            />

            <AvatarFallback className="bg-zinc-900 text-zinc-200">

                {currentUser?.name
                ?.slice(0, 2)
                .toUpperCase() || "U"}

            </AvatarFallback>

            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col text-left">

            <p className="truncate text-sm font-medium text-zinc-100">
                {currentUser?.name}
            </p>

            <p className="truncate text-xs text-zinc-500">
                @{currentUser?.userName}
            </p>

            </div>

            <MoreVertical className="h-4 w-4 shrink-0 text-zinc-500" />

        </button>

        </DropdownMenuTrigger>

        <DropdownMenuContent
        align="end"
        className="w-56 border-zinc-800 bg-zinc-950 text-zinc-100"
        >

        <DropdownMenuItem
            className="cursor-pointer"
            onClick={() =>
            navigate(`/profile/${currentUser?.id}`)
            }
        >

            <User className="mr-2 h-4 w-4" />

            View Profile

        </DropdownMenuItem>

        <DropdownMenuItem
            className="cursor-pointer text-red-500 focus:text-red-500"
            onClick={() => signOut()}
        >

            <LogOut className="mr-2 h-4 w-4" />

            Logout

        </DropdownMenuItem>

        </DropdownMenuContent>

    </DropdownMenu>

    </div>
    </div>
  )
}

export default Sidebar