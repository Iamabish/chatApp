import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Hash } from "lucide-react"
import useRoom from "@/hooks/useRoom"
import { useNavigate } from "react-router"

const CreateRoom = () => {
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")

  const navigate = useNavigate()

  const {   createRoomMutation } = useRoom()

  function handleSubmit() {
    console.log({ slug, description,  })

    createRoomMutation.mutate({
        slug: slug,
        description : description
    },
    {
      onSuccess : (res) => {

        console.log('create room data', res);

        const roomId = res?.data?.id

        navigate(`/room/${roomId}`)
    
      }
    }
    
  )

  }

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md px-6">

        <div className="mb-8">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
            <Hash className="h-5 w-5 text-zinc-400" />
          </div>
          <h1 className="text-lg font-semibold text-white">Create a room</h1>
          <p className="text-sm text-zinc-500">Set up a space for your community.</p>
        </div>

        <div className="flex flex-col gap-5">

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-zinc-400 uppercase tracking-widest">Slug</Label>
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 px-3">
              <span className="text-zinc-600 text-sm">#</span>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, "-"))}
                placeholder="my-room"
                className="border-0 bg-transparent text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-zinc-400 uppercase tracking-widest">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this room about?"
              rows={3}
              className="resize-none rounded-xl border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600 focus-visible:ring-0"
            />
          </div>


          <Button
            onClick={handleSubmit}
            className="mt-2 w-full rounded-xl bg-white text-black hover:bg-zinc-200"
          >
            Create Room
          </Button>

        </div>
      </div>
    </div>
  )
}

export default CreateRoom