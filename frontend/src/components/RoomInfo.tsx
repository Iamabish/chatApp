import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Calendar,
  Crown,
  LogOut,
  Pencil,
  Loader2,
  X,
  Check,
  Camera,
} from "lucide-react"
import { useParams } from "react-router"
import { useSession } from "@/lib/auth.client"
import { useQuery } from "@tanstack/react-query"
import { getSingleRoom, uploadFileRoom } from "@/api/room"
import RoomInfoLoader from "./loaders/RoomInfoLoader"
import { useEffect, useRef, useState } from "react"
import useRoom from "@/hooks/useRoom"
import { Input } from "./ui/input"
const RoomInfo = () => {
    const fileRef = useRef<HTMLInputElement | null>(null)
    const [editing, setEditing] = useState(false)
    const [slug, setSlug] = useState("")
    const [description, setDescription] = useState("")
    const [avatarUrl, setAvatarUrl] = useState("")
    const [uploadingImage, setUploadingImage] = useState(false)

  const { id } = useParams()

  const { data: session } = useSession()
  const {updateRoomMutation} = useRoom()

  const userId = session?.user?.id

  const {
    data,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["room", id],
    queryFn: () =>
      getSingleRoom(id as string),
    enabled: !!id,
  })

  const room = data?.data

  const isAdmin =
    room?.adminId === userId

    useEffect(() => {
        if (room) {
            setSlug(room.slug || "")
            setDescription(room.description || "")
            setAvatarUrl(room.avatarUrl || "")
        }
    }, [room])

    async function handleUploadImage(file: File) {
        if (!file) return

        try {
            setUploadingImage(true)
            const formData = new FormData()
            formData.append("file", file)
            const res = await uploadFileRoom(formData)
            setAvatarUrl(res.data.url)
        } catch (error) {
            console.log(error)
        } finally {
            setUploadingImage(false)
        }
    }

    function handleUpdateRoom() {
        updateRoomMutation.mutate(
            {
            id : id,
            payload: {
                slug,
                description,
                avatarUrl,
            },
            },
            {
            onSuccess: () => {
                setEditing(false)
            },
            }
        )
    }

  if (isPending) {
    return <RoomInfoLoader />
  }

  if (isError || !room) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-zinc-400">
          Failed to load room
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-black text-white">

      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-black/80 px-6 py-4 backdrop-blur">

        <h1 className="text-sm font-semibold tracking-tight">
          Room Info
        </h1>

        {isAdmin && !editing && (
            <Button
                size="sm"
                variant="ghost"
                className="gap-2 text-zinc-400 hover:text-white"
                onClick={() => setEditing(true)}
            >
                <Pencil className="h-3.5 w-3.5" />
                Edit
            </Button>
            )}

            {editing && (
                <div className="flex gap-2">

                    <Button
                    size="sm"
                    variant="ghost"
                    className="text-zinc-500 hover:text-white"
                    onClick={() => {
                        setEditing(false)

                        setSlug(room.name || "")
                        setDescription(room.description || "")
                        setAvatarUrl(room.avatarUrl || "")
                    }}
                    >
                    <X className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                    size="sm"
                    onClick={handleUpdateRoom}
                    disabled={
                        updateRoomMutation.isPending ||
                        uploadingImage
                    }
                    className="gap-1.5 bg-white text-black hover:bg-zinc-200"
                    >
                    {updateRoomMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Check className="h-3.5 w-3.5" />
                    )}

                    Save
                    </Button>

                </div>
            )}

      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-10">

        <div className="flex flex-col items-center gap-4">

          <div className="relative">

            <Avatar className="h-24 w-24 border-2 border-zinc-800">

                <AvatarImage src={avatarUrl} />

                <AvatarFallback className="bg-zinc-900 text-2xl">
                {slug?.slice(0, 2).toUpperCase()}
                </AvatarFallback>

            </Avatar>

            {editing && (
                <>
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-zinc-200"
                    >
                        {uploadingImage ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                        <Camera className="h-3.5 w-3.5" />
                        )}
                    </button>

                    <input
                        hidden
                        ref={fileRef}
                        type="file"
                        onChange={(e) => {
                        const file = e.target.files?.[0]

                        if (file) {
                            handleUploadImage(file)
                        }
                        }}
                    />
                </>
            )}

        </div>

          <div className="text-center">

            {editing ? (
                <Input
                    value={slug}
                    onChange={(e) =>
                    setSlug(e.target.value)
                    }
                    className="max-w-[240px] border-zinc-700 bg-zinc-900 text-center text-white"
                />
                ) : (
                <>
                    

                    <p className="text-xl font-semibold ">
                         #{room.slug}
                    </p>
                </>
                )}

          </div>

        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">

          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
            Description
          </p>

          {editing ? (
            <Input
                value={description}
                onChange={(e) =>
                setDescription(e.target.value)
                }
                placeholder="Room description..."
                className="border-zinc-700 bg-zinc-900 text-white"
            />
            ) : (
            <p className="text-sm text-zinc-300">
                {room.description ||
                "No description provided."}
            </p>
            )}

        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">

          <p className="px-5 pt-4 pb-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
            Statistics
          </p>

          <div className="flex items-center justify-between px-5 py-3">

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">
                Members
              </span>
            </div>

            <span className="text-sm">
              {room._count?.member|| 0}
            </span>

          </div>


          <Separator className="bg-zinc-800" />

          <div className="flex items-center justify-between px-5 py-3">

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">
                Created
              </span>
            </div>

            <span className="text-sm ">
              {new Date(
                room.createdAt
              ).toLocaleDateString("en-In", {
                day : 'numeric',
                month : 'short',
                year : 'numeric'
              })}
            </span>

          </div>

        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">

          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-600">
            Admin
          </p>

          <div className="flex items-center gap-3">

            <Avatar className="h-10 w-10">

              <AvatarImage
                src={room.admin?.avatarUrl}
              />

              <AvatarFallback>
                {room.admin?.userName?.[0]}
              </AvatarFallback>

            </Avatar>

            <div className="flex-1">

              <p className="text-sm font-medium">
                {room.admin?.userName}
              </p>

              <p className="text-xs text-zinc-500">
                Room Administrator
              </p>

            </div>

            <Crown className="h-4 w-4 text-amber-400" />

          </div>

        </div>

        <Button
          variant="destructive"
          className="gap-2 rounded-2xl"
        >
          <LogOut className="h-4 w-4" />
          Leave Room
        </Button>

      </div>
    </div>
  )
}

export default RoomInfo