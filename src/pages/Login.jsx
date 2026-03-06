import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SettrAvatar from '../components/SettrAvatar'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    navigate('/builder')
  }

  return (
    <div className="scanline min-h-screen flex items-center justify-center">
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#39ff14 1px, transparent 1px), linear-gradient(90deg, #39ff14 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="border border-rambo-border bg-rambo-card/60 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <SettrAvatar size={36} />
            <div>
              <h2 className="text-lg text-rambo-green font-bold">Log In</h2>
              <p className="text-[10px] text-rambo-dim tracking-wider">SETT3R // BUILDER ACCESS</p>
            </div>
          </div>

          {error && (
            <div className="border border-rambo-red/30 bg-rambo-red/5 rounded p-3 mb-4">
              <p className="text-xs text-rambo-red">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] text-rambo-dim tracking-wider block mb-1">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@business.com"
                className="w-full bg-rambo-bg border border-rambo-border rounded px-3 py-2 text-sm text-rambo-text placeholder:text-rambo-dim/40 focus:border-rambo-green focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-rambo-dim tracking-wider block mb-1">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Your password"
                className="w-full bg-rambo-bg border border-rambo-border rounded px-3 py-2 text-sm text-rambo-text placeholder:text-rambo-dim/40 focus:border-rambo-green focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rambo-green text-rambo-bg font-bold py-3 rounded text-sm tracking-wider hover:shadow-[0_0_15px_#39ff14] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'LOGGING IN...' : 'LOG IN >>'}
            </button>
          </form>

          <p className="text-[10px] text-rambo-dim text-center mt-4">
            Don't have an account?{' '}
            <button onClick={() => navigate('/#pricing')} className="text-rambo-green hover:underline cursor-pointer">
              Get SETT3R
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
