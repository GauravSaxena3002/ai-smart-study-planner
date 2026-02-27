import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../api"

function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const res = await API.post("/auth/register", {
        username,
        email,
        password,
      })

      localStorage.setItem("token", res.data.token)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">
          Register
        </h2>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 rounded bg-slate-700 focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded bg-slate-700 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-slate-700 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition p-3 rounded font-semibold"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-slate-400">
          Already have an account?{" "}
          <Link to="/" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
