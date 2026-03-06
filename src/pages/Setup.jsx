import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SettrAvatar from '../components/SettrAvatar'

export default function Setup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [step, setStep] = useState(1) // 1 = create account, 2 = success
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If they land here with a session_id, we could verify the Stripe session
  // For now, we just let them create their account

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { business_name: businessName }
        }
      })

      if (authError) throw authError

      // Create their sett3r_clients row via RPC (bypasses RLS for unconfirmed users)
      const { error: insertError } = await supabase.rpc('create_sett3r_client', {
        p_user_id: authData.user.id,
        p_email: email,
        p_business_name: businessName,
        p_stripe_session: sessionId || null,
        p_tier: 'lite',
      })

      if (insertError) throw insertError

      setStep(2)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (step === 2) {
    return (
      <div className="scanline min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#39ff14 1px, transparent 1px), linear-gradient(90deg, #39ff14 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10 max-w-md w-full mx-4">
          <div className="border border-rambo-border bg-rambo-card/60 rounded-lg p-8 text-center">
            <SettrAvatar size={64} />
            <h2 className="text-xl text-rambo-green font-bold mt-4 mb-2">Account Created</h2>
            <p className="text-sm text-rambo-dim mb-6">
              Your SETT3R account is live. Check your email to verify, then head to the builder to configure your AI setter.
            </p>
            <div className="border border-rambo-border bg-rambo-bg/60 rounded p-4 mb-6 text-left text-sm">
              <p className="text-rambo-text leading-loose">
                <span className="text-rambo-green">$&gt;</span> Account created for {businessName}<br />
                <span className="text-rambo-green">$&gt;</span> CRM account provisioning...<br />
                <span className="text-rambo-green">$&gt;</span> You'll receive an onboarding email shortly.<span className="cursor-blink" />
              </p>
            </div>
            <button
              onClick={() => navigate('/builder')}
              className="w-full bg-rambo-green text-rambo-bg font-bold py-3 rounded text-sm tracking-wider hover:shadow-[0_0_15px_#39ff14] transition-all cursor-pointer"
            >
              OPEN BUILDER &gt;&gt;
            </button>
          </div>
        </div>
      </div>
    )
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
              <h2 className="text-lg text-rambo-green font-bold">Create Your Account</h2>
              <p className="text-[10px] text-rambo-dim tracking-wider">SETT3R // DEPLOYMENT PORTAL</p>
            </div>
          </div>

          {error && (
            <div className="border border-rambo-red/30 bg-rambo-red/5 rounded p-3 mb-4">
              <p className="text-xs text-rambo-red">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-[10px] text-rambo-dim tracking-wider block mb-1">BUSINESS NAME</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                required
                placeholder="e.g. Peak Performance Studio"
                className="w-full bg-rambo-bg border border-rambo-border rounded px-3 py-2 text-sm text-rambo-text placeholder:text-rambo-dim/40 focus:border-rambo-green focus:outline-none"
              />
            </div>
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
                minLength={6}
                placeholder="Min 6 characters"
                className="w-full bg-rambo-bg border border-rambo-border rounded px-3 py-2 text-sm text-rambo-text placeholder:text-rambo-dim/40 focus:border-rambo-green focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rambo-green text-rambo-bg font-bold py-3 rounded text-sm tracking-wider hover:shadow-[0_0_15px_#39ff14] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'DEPLOYING...' : 'CREATE ACCOUNT >>'}
            </button>
          </form>

          <p className="text-[10px] text-rambo-dim text-center mt-4">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-rambo-green hover:underline cursor-pointer">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
