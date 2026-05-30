import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchRoom } from "@/api/room";
import { Button } from "./ui/button";
import useRoom from "@/hooks/useRoom";
import { useNavigate } from "react-router";
import { useSocketStore } from "@/store/socket/useSocket";


interface SearchRoomProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SearchModal({
  open,
  setOpen,
}: SearchRoomProps) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate()

 

  const debounceValue = useDebounce(search, 500)

  const {
      data,
    } 
    = useInfiniteQuery({
      queryKey: ["searchRooms", debounceValue],
      queryFn: ({ pageParam = 1 }) =>
        searchRoom(debounceValue, pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const currentPage = lastPage.data.currPage
        const totalPages = lastPage.data.total_pages
        return currentPage < totalPages
          ? currentPage + 1
          : undefined
      },
      staleTime: 0
    })

    const { onlineInRoom } = useSocketStore()

    const { joinRoomMutation } = useRoom()

    function handleJoin(id: string) {      
      joinRoomMutation.mutate({id}, 
        {
          onSuccess : () => {
            navigate(`/room/${id}`)
          }
        }
      )
    }

    const rooms = data?.pages?.flatMap((page) => page.data.data) || []
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent
        className="
          max-w-xl
          overflow-hidden
          rounded-2xl
          border
          border-zinc-900
          bg-zinc-950
          p-0
          text-zinc-100
          shadow-2xl
        "
      >
        <div className="border-b border-zinc-900">
            <div className="flex items-center gap-3 px-4 py-3">
              <Search className="h-4 w-4 text-zinc-500" />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rooms..."
                className="
                  border-0
                  bg-transparent
                  text-zinc-100
                  placeholder:text-zinc-500
                  focus-visible:ring-0
                  focus-visible:ring-offset-0
                "
              />
            </div>
        </div>


      <div className="max-h-[420px] overflow-y-auto p-2">
        {rooms.length > 0 ? (
          <div className="space-y-1">
            {rooms.map((room) => {
              const alreadyJoined = Boolean(
                onlineInRoom[room.id]
              );

              return (
                <div
                  key={room.id}
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    px-3
                    py-3
                    transition-colors
                    hover:bg-zinc-900
                  "
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        #{room.slug}
                      </p>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-zinc-500">
                        {room._count.member}{" "}
                        {room._count.member === 1
                          ? "member"
                          : "members"}
                      </span>

                      {room.description && (
                        <>
                          <span className="text-zinc-700">
                            •
                          </span>

                          <span className="truncate text-xs text-zinc-500">
                            {room.description}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    disabled={alreadyJoined}
                    onClick={() =>
                      handleJoin(room.id)
                    }
                    className={
                      alreadyJoined
                        ? `
                          ml-4
                          cursor-not-allowed
                          bg-zinc-800
                          text-zinc-500
                          hover:bg-zinc-800
                        `
                        : `
                          ml-4
                          bg-zinc-100
                          text-black
                          hover:bg-zinc-200
                        `
                    }
                  >
                    {alreadyJoined
                      ? "Joined"
                      : "Join"}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-zinc-500">
              No rooms found
            </p>
          </div>
        )}
      </div>
       
      </DialogContent>
    </Dialog>
  );
}