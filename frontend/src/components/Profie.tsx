import { getSingleUser, uploadImage } from "@/api/user"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Camera,
  Check,
  LogOut,
  MessageCircle,
  Pencil,
  Shield,
  Bell,
  X,
  Loader2,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useSession, signOut } from "@/lib/auth.client"

import {
  useQuery,
} from "@tanstack/react-query"
import useUser from "@/hooks/useUser"

const Profile = () => {

  const navigate = useNavigate()

  const fileRef = useRef<HTMLInputElement | null>(null)

  const { id: profileId } = useParams()

  const { data: session } = useSession()

  const { updateUserMutation } = useUser(profileId)

  const currentUser = session?.user

  const [editing, setEditing] = useState(true)

  const [name, setName] = useState("")

  const [bio, setBio] = useState("")

  const [avatarUrl, setAvatarUrl] = useState("")

  const [uploadingImage, setUploadingImage] = useState(false)

  const {
    data,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["profile", profileId],

    queryFn: () =>
      getSingleUser(profileId as string),

    enabled: !!profileId,
  })

  const profile = data?.data

  const isOwnProfile =
    currentUser?.id === profileId

  useEffect(() => {

    if (profile) {

      setName(profile.name || "")

      setBio(profile.bio || "")

      setAvatarUrl(
        profile.image ||
        profile.avatarUrl ||
        ""
      )
    }

  }, [profile])

  async function handleUploadImage(
    file: File
  ) {

    if (!file) return

    try {

      setUploadingImage(true)

      const formData = new FormData()

      formData.append("image", file)

      const res = await uploadImage(formData)

      setAvatarUrl(res.data.url)

    } catch (err) {

      console.log(err)

    } finally {

      setUploadingImage(false)
    }
  }

  async function handleUpdateProfile() {

    updateUserMutation.mutate({
      id: profileId,
      payload: {
        bio,
        name,
        avatarUrl,
      }
    },
    {
      onSuccess: () => {
        setEditing(false)
      }
    })
  }

  if (isPending) {

    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (isError || !profile) {

    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-zinc-400">
          Failed to load profile
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white overflow-y-auto">

      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-black/80 px-6 py-4 backdrop-blur">

        <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
          Profile
        </h1>

        {isOwnProfile && !editing && (
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

                setName(profile.name || "")

                setBio(profile.bio || "")

                setAvatarUrl(
                  profile.image ||
                  profile.avatarUrl ||
                  ""
                )
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>

            <Button
              size="sm"
              disabled={
                updateUserMutation.isPending ||
                uploadingImage
              }
              className="gap-1.5 bg-white text-black hover:bg-zinc-200"
              onClick={handleUpdateProfile}
            >

              {updateUserMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}

              Save

            </Button>

          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-lg px-6 py-10 flex flex-col gap-8">

        <div className="flex flex-col items-center gap-4">

          <div className="relative">

            <Avatar className="h-24 w-24 border-2 border-zinc-800">

              <AvatarImage
                src={avatarUrl}
              />

              <AvatarFallback className="bg-zinc-900 text-2xl font-medium text-zinc-200">
                {profile.name
                  ?.slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>

            </Avatar>

            {editing && (
              <>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-zinc-200 transition-colors"
                >

                  {uploadingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}

                </button>

                <input
                  type="file"
                  hidden
                  ref={fileRef}
                  onChange={(e) => {

                    const file =
                      e.target.files?.[0]

                    if (file) {
                      handleUploadImage(file)
                    }
                  }}
                />
              </>
            )}
          </div>

          {editing ? (

            <Input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="max-w-[200px] border-zinc-700 bg-zinc-900 text-center text-white"
            />

          ) : (

            <div className="text-center">

              <p className="text-lg font-semibold">
                {profile.name}
              </p>

              <p className="text-sm text-zinc-500">
                @{profile.userName}
              </p>

            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">

          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
            Bio
          </p>

          {editing ? (

            <Input
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              placeholder="Write something about yourself..."
              className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
            />

          ) : (

            <p className="text-sm text-zinc-300">
              {profile.bio || "No bio yet."}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 flex flex-col gap-3">

          <p className="text-xs font-medium uppercase tracking-widest text-zinc-600">
            Info
          </p>

          <div className="flex justify-between text-sm">

            <span className="text-zinc-500">
              Email
            </span>

            <span className="text-zinc-300">
              {profile.email}
            </span>

          </div>

          <Separator className="bg-zinc-800" />

          <div className="flex justify-between text-sm">

            <span className="text-zinc-500">
              Username
            </span>

            <span className="text-zinc-300">
              @{profile.userName}
            </span>

          </div>
        </div>

        {isOwnProfile && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">

            <p className="px-5 pt-4 pb-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
              Settings
            </p>

            {[
              {
                icon: Bell,
                label: "Notifications",
              },

              {
                icon: Shield,
                label: "Privacy & Security",
              },
            ].map(({ icon: Icon, label }) => (

              <button
                key={label}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-sm text-zinc-300 hover:bg-zinc-900 transition-colors"
              >
                <Icon className="h-4 w-4 text-zinc-500" />
                {label}
              </button>

            ))}

            <Separator className="bg-zinc-800" />

            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 px-5 py-3.5 text-sm text-red-500 hover:bg-zinc-900 transition-colors"
            >

              <LogOut className="h-4 w-4" />

              Sign Out

            </button>

          </div>
        )}

        {!isOwnProfile && (
          <Button
            className="w-full gap-2 rounded-2xl bg-white text-black hover:bg-zinc-200"
            onClick={() =>
              navigate(`/chat/${profileId}`)
            }
          >
            <MessageCircle className="h-4 w-4" />
            Send Message
          </Button>
        )}

      </div>
    </div>
  )
}

export default Profile