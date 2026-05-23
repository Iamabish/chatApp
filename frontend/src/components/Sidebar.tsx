import { getSideBarUser } from "@/api/user"
import { useInfiniteQuery } from "@tanstack/react-query"
import SidebarUser from "./SidebarUser"
import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"
import { Link } from "react-router"

const Sidebar = () => {


    

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

    staleTime: 1000 * 60 * 5,
  })

  const users =
    data?.pages.flatMap(
      (page) => page.data.data
    ) || []

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-[420px] flex-col border-r border-zinc-900 bg-black">

      <div className="border-b border-zinc-900 px-5 py-4">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
          Messages
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          {users.length} users
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">

          {users.map((user, index) => (
            <Link to={`/chat/${user.id}`}>
                <SidebarUser
                key={user.id}
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
    </div>
  )
}

export default Sidebar