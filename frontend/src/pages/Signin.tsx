import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { signIn } from "@/lib/auth.client"
import { toast } from "sonner"
import {  useNavigate } from "react-router"

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
})

type FormValues = z.infer<typeof formSchema>

const Signin = () => {

  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const navigate = useNavigate()

  console.log('url', import.meta.env.VITE_APP_URL);
  
  async function onSubmit(data: FormValues) {
    await signIn.email({
      email: data.email,
      password: data.password,
    },
    {
      onSuccess: () => {
        toast.success("Signin  successfully")
        navigate("/")
        },
        onError: (ctx) => {
        const message =
            ctx?.error?.message ||
            "Failed to Signin. Please try again."

          toast.error(message)
        }
    }
    )
  }

  console.log('signin url', import.meta.env.VITE_APP_URL);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <Card className="w-full max-w-sm border border-zinc-800 bg-zinc-950 text-white shadow-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Sign in
          </CardTitle>

          <CardDescription className="text-zinc-400">
            Enter your email and password to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="h-11 border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700"
              />

              {errors.email && (
                <p className="text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className="h-11 border-zinc-800 bg-zinc-900 pr-10 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full bg-white text-black hover:bg-zinc-200"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>

              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950 px-2 text-zinc-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-900 hover:text-white"
              onClick={async () => {

             console.log({
                  callback: import.meta.env.VITE_FRONTEND_URL,
                  origin: window.location.origin
              })
                

                await signIn.social({
                  provider: "google",
                  callbackURL: import.meta.env.VITE_FRONTEND_URL
                })

              }
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="mr-2 h-4 w-4"
              >
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.2 36 26.7 37 24 37c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.5 16.2 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6.1 7.1l6.2 5.2C39.2 36.7 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"
                />
              </svg>

              Continue with Google
            </Button>

            <p className="text-center text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <button
              onClick={() => navigate('/auth/signup')}
                type="button"
                className="font-medium text-white hover:text-zinc-300"
              >
                Sign up
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Signin