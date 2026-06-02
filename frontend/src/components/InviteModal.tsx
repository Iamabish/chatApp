import React, { useState } from "react"
import { Search } from "lucide-react"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { useInfiniteQuery } from "@tanstack/react-query"

import { useDebounce } from "@/hooks/useDebounce"
import { inviteUser } from "@/api/room"
import useRoom from "@/hooks/useRoom"

interface InviteModalProps {
  open: boolean
  setOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >
  roomId: string
}

const InviteModal = ({
  open,
  setOpen,
  roomId,
}: InviteModalProps) => {
  const [search, setSearch] = useState("")

  const debouncedSearch = useDebounce(search,500)

  const { inviteRoomMemberMutation } =
    useRoom(roomId)

    const {
        data,
        isLoading,
        isFetching,
    } = useInfiniteQuery({
    queryKey: ["inviteUsers",roomId,debouncedSearch],

    queryFn: ({ pageParam = 1 }) =>
        inviteUser(
        debouncedSearch,
        roomId,
        pageParam
        ),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
        const currentPage =
        lastPage.data.currPage

        const totalPages =
        lastPage.data.total_pages

        return currentPage < totalPages
        ? currentPage + 1
        : undefined
    },

    enabled: open,
    })

  const users =
    data?.pages?.flatMap(
      (page) => page.data.data
    ) || []

  return (
    
  <Dialog
    open={open}
    onOpenChange={setOpen}
  >
    <DialogContent
      className="max-w-xl overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 p-0 text-zinc-100
        shadow-2xl
      "
    >
      <div className="border-b border-zinc-900">
        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="h-4 w-4 text-zinc-500" />

          <Input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search users..."
            className="border-0 bg-transparent text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0
              focus-visible:ring-offset-0
            "
          />
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-1">
            {users.map((user: any) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-xl px-3 py-3
                  transition-colors
                  hover:bg-zinc-900
                "
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={
                        user.avatarUrl ||
                        user.image ||
                        ""
                      }
                    />

                    <AvatarFallback className="bg-zinc-800">
                      {user.userName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-sm font-medium">
                      {user.userName}
                    </p>

                    {user.name && (
                      <p className="text-xs text-zinc-500">
                        {user.name}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  disabled={
                    inviteRoomMemberMutation.isPending
                  }
                  onClick={() =>
                    inviteRoomMemberMutation.mutate(
                      {
                        roomId,
                        userId: user.id,
                      },
                      {
                        onSuccess: () => {
                          setSearch("")
                          setOpen(false)
                        },
                      }
                    )
                  }
                  className="
                    bg-zinc-100
                    text-black
                    hover:bg-zinc-200
                  "
                >
                  Invite
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-zinc-500">
              No users found
            </p>
          </div>
        )}
      </div>
    </DialogContent>
  </Dialog>

  )
}

export default InviteModal