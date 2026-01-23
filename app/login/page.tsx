"use client"


import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"


export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)

    if (!email || !password) {
        setError("Please enter email and password")
        return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      return
    }

    router.refresh()
    router.push("/admin")
  }

  return (
    <main className="max-w-sm mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4 text-center">Admin Login</h1>

      <input
        className="border w-full mb-3 p-2"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        className="border w-full mb-3 p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <button
        onClick={handleLogin}
        className="w-full bg-black text-white py-2"
      >
        Login
      </button>
    </main>
  )
}
