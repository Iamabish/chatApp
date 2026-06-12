import { getSideBarRoom, getSideBarUser } from "@/api/user"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import SidebarUser from "./SidebarUser"
import { Button } from "./ui/button"
import { Loader2, LogOut, MoreVertical, Plus, User } from "lucide-react"
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


interface SidebarProps {
    onOpenSearch : () => void
}

const Sidebar = ({onOpenSearch} : SidebarProps ) => {

  const navigate = useNavigate()

  const { data: session } = useSession()


  const queryClient = useQueryClient()

  const currentUser = session?.user

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["sidebar-users"],

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

  const meResponse = queryClient.getQueryData(['me'])

  console.log('logged user data ', meResponse);
  
  //@ts-ignore
  const me = meResponse?.data
  
  const {
    data : roomsJoined,
  } = useQuery({
    queryKey: ["sidebar-rooms"],
    queryFn : getSideBarRoom
  })


    const users =
    data?.pages.flatMap(
      (page) => page.data.data
    ) || []

    const rooms = roomsJoined?.data?.data || []
    const finalRender = [...rooms,...users]

  return (
    isLoading ? (
        <>
        <SidebarLoader />
        </>
    ) : (
        <div className="flex h-screen w-[420px] flex-col border-r border-zinc-900 bg-black">
      <div className="border-b border-zinc-900 shrink-0">
        <div className="px-5 pt-4">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
            Messages
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
            {users.length} users
            </p>
        </div>
        <div className="flex gap-2 p-4">
            <Button
            onClick={() => navigate("create-room")}
            className="flex-1 cursor-pointer"
            >
            <Plus className="size-4" />
            Create Room
            </Button>
            <Button
            variant="secondary"
            onClick={onOpenSearch}
            className="flex-1 cursor-pointer bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
            >
            <Plus className="size-4" />
            Join Room
            </Button>
        </div>
        </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          {
            finalRender.map((item) => {
                const slug = "slug" in item
                return (
                    <Link
                        key={item.id}
                        to={`${slug ?`/room/${item.id}`:`/chat/${item.id}`}`}>
                        <SidebarUser
                            image={item.image}
                            avatarUrl={item.avatarUrl}
                            userName={item.userName}
                            userId={item.id}
                            slug={item?.slug}
                        />
                    </Link>
                )
            })
          }
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
                src={me?.image || me?.avatarUrl || ""}
              />

              <p>{me?.name}</p>

              <p>@{me?.userName}</p>
            <AvatarFallback className="bg-zinc-900 text-zinc-200">
                {me?.name
                ?.slice(0, 2)
                .toUpperCase() || "U"}
            </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col text-left">
            <p className="truncate text-sm font-medium text-zinc-100">
                {me?.name}
            </p>
            <p className="truncate text-xs text-zinc-500">
                @{me?.userName}
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
  )
}

export default Sidebar