
const AuthLoader = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
        
        <p className="text-xs text-zinc-600 tracking-widest uppercase">
          Authenticating
        </p>

      </div>
    </div>
  )
}


export default AuthLoader