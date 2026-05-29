import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "@/lib/auth.client"
import { cn } from "@/lib/utils"
import { useSocketStore } from "@/store/socket/useSocket"

interface SidebarUserProps {
  userId: string
  avatarUrl: string | null
  userName: string,
  image : string,
  slug : string
}

const SidebarUser = ({
  userId,
  avatarUrl,
  image,
  userName,
  slug
  
}: SidebarUserProps) => {

  const { onlineUsers } = useSocketStore()


  const {data } = useSession()
  const usreid = data?.user.id

  const isOnline = onlineUsers.includes(userId)


  return (
    <button
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-all duration-200",
        "hover:border-zinc-800 hover:bg-zinc-950/80",
        "active:scale-[0.98]"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12 border border-zinc-800">

          <AvatarImage
            src={image || avatarUrl || ""}
            alt={userName || slug}
          />

          <AvatarFallback className="bg-zinc-900 text-sm font-medium text-zinc-200">
            {userName?.slice(0, 2).toUpperCase() || slug?.slice(0, 2).toUpperCase()}
          </AvatarFallback>

        </Avatar>

        {isOnline && (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-black bg-emerald-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="truncate text-sm font-semibold tracking-tight text-zinc-100">
           {slug ? "#" :""}  {userName || slug}
          </h4>
        </div>

        {!slug &&  (

            <div className="mt-1 flex items-center gap-2">

              {!isOnline && (
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
              )}

              <p className="text-xs text-zinc-400">
                {isOnline ? "Online" : "Offline"}
              </p>

            </div>

        )}

        
      </div>
    </button>
  )
}

export default SidebarUser