import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SettrAvatar from '../components/SettrAvatar'

const PERSONALITIES = ['Direct', 'Warm', 'Funny', 'Elite coach', 'Luxury']

const SCENARIOS = {
  price_shopper: { label: 'Price Shopper', tag: 'price_shopper' },
  busy: { label: 'Busy / Short Replies', tag: 'busy_lead' },
  curious: { label: 'Curious / Interested', tag: 'curious' },
  unqualified: { label: 'Unqualified', tag: 'unqualified' },
}

const DEFAULT_PROMPT = `You are an AI appointment setter for {{business_name}}.
Your personality is {{personality}}.
Your goal: qualify leads and book them into a consultation.

Rules:
- Never be pushy. Mirror their energy.
- Ask max 3 qualifying questions before offering a booking.
- If unqualified, gracefully exit and tag appropriately.
- Always confirm date/time before booking.

Qualifying questions:
1. What's the main goal you're looking to achieve?
2. Have you tried anything before for this?
3. What's your timeline - are you looking to start soon?`

function generateReply(scenario, personality, businessName, message, turnCount) {
  const biz = businessName || 'our team'
  const tone = personality || 'Direct'

  const greetings = {
    Direct: `Hey. Thanks for reaching out to ${biz}. Quick question -`,
    Warm: `Hey there! So glad you messaged ${biz}. I'd love to help you out.`,
    Funny: `Well well well... another victim for ${biz}. Just kidding. Mostly.`,
    'Elite coach': `Appreciate you reaching out to ${biz}. Not everyone takes this step.`,
    Luxury: `Welcome. You've connected with ${biz}. Let's see if we're the right fit.`,
  }

  const scenarioReplies = {
    price_shopper: {
      replies: [
        `I totally get it - price matters. Before I throw numbers at you, can I ask what you're actually looking to achieve? That way I can tell you exactly what you'd get.`,
        `Great. And have you invested in anything like this before? Just want to make sure I recommend the right option for you.`,
        `Perfect. So here's the thing - we've got a few options depending on where you're at. The best way to figure out the right one is a quick 15-min call with ${biz}. I can get you booked in - what day works?`,
      ],
      actions: ['ask_q1', 'ask_q2', 'offer_booking'],
    },
    busy: {
      replies: [
        `No worries, I'll keep it quick. What's the #1 thing you're looking for from ${biz}?`,
        `Got it. Want me to get you a quick 15-min slot so we can sort it? Takes 2 mins to book.`,
        `Done. I'll send the link. Talk soon.`,
      ],
      actions: ['ask_q1_short', 'offer_booking', 'confirm_booking'],
    },
    curious: {
      replies: [
        `Great question! ${biz} specialises in exactly that. Let me ask - what's your main goal right now?`,
        `Love that. And have you worked with anyone on this before, or is this your first time exploring it?`,
        `You sound like a great fit. The next step is a quick discovery call - no pressure, just a conversation. Want me to find you a slot this week?`,
      ],
      actions: ['ask_q1', 'ask_q2', 'offer_booking'],
    },
    unqualified: {
      replies: [
        `Thanks for reaching out! Quick one - are you based in our service area? Just want to make sure we can actually help you.`,
        `Ah got it. Unfortunately we're not the best fit for what you need right now. But I'd recommend checking out [alternative]. They might be more aligned.`,
        `No problem at all. Best of luck with everything!`,
      ],
      actions: ['qualify_check', 'disqualify', 'exit_gracefully'],
    },
  }

  const data = scenarioReplies[scenario] || scenarioReplies.curious
  const idx = Math.min(turnCount, data.replies.length - 1)

  let reply = turnCount === 0
    ? greetings[tone] + ' ' + data.replies[0]
    : data.replies[idx]

  return {
    text: reply,
    action: data.actions[idx] || 'continue',
    tag: SCENARIOS[scenario]?.tag || 'unknown',
  }
}

export default function Builder() {
  const navigate = useNavigate()
  const chatEndRef = useRef(null)

  const [businessName, setBusinessName] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [personality, setPersonality] = useState('Direct')
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [jsonPreview, setJsonPreview] = useState(null)
  const [saved, setSaved] = useState(false)

  const [scenario, setScenario] = useState('price_shopper')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([])
  const [turnCount, setTurnCount] = useState(0)

  const [score, setScore] = useState(0)
  const [showBooking, setShowBooking] = useState(false)

  const steps = [
    { label: 'Business name', done: businessName.length > 2 },
    { label: 'Target audience', done: targetAudience.length > 2 },
    { label: 'Personality selected', done: !!personality },
    { label: 'Prompt configured', done: prompt !== DEFAULT_PROMPT },
    { label: 'Config generated', done: !!jsonPreview },
    { label: 'Draft saved', done: saved },
    { label: 'Chat tested (3+ turns)', done: turnCount >= 3 },
  ]

  useEffect(() => {
    let s = 0
    if (businessName.length > 2) s += 10
    if (targetAudience.length > 2) s += 10
    if (personality) s += 10
    if (prompt !== DEFAULT_PROMPT) s += 10
    if (jsonPreview) s += 20
    if (saved) s += 15
    s += Math.min(turnCount * 5, 25)
    setScore(Math.min(s, 100))
  }, [businessName, targetAudience, personality, prompt, jsonPreview, saved, turnCount])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const statusColor = score >= 80 ? 'text-rambo-green' : score >= 40 ? 'text-rambo-amber' : 'text-rambo-red'
  const statusLabel = score >= 80 ? 'GREEN - READY' : score >= 40 ? 'AMBER - PARTIAL' : 'RED - INCOMPLETE'
  const barColor = score >= 80 ? 'bg-rambo-green' : score >= 40 ? 'bg-rambo-amber' : 'bg-rambo-red'

  function handleGenerate() {
    const config = {
      version: '1.0',
      engine: 'SETT3R',
      business: businessName || 'Unnamed',
      target_audience: targetAudience || 'Not specified',
      personality,
      channels: ['instagram_dm', 'sms', 'email'],
      qualifying_questions: 3,
      max_followups: 5,
      booking_integration: 'calendly',
      prompt_hash: btoa(prompt).slice(0, 12),
      created: new Date().toISOString(),
    }
    setJsonPreview(config)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleSend() {
    if (!chatInput.trim()) return
    const userMsg = { role: 'user', text: chatInput }
    const reply = generateReply(scenario, personality, businessName, chatInput, turnCount)
    const botMsg = { role: 'bot', text: reply.text, action: reply.action, tag: reply.tag }

    setMessages(prev => [...prev, userMsg, botMsg])
    setChatInput('')
    setTurnCount(prev => prev + 1)
  }

  function resetChat() {
    setMessages([])
    setTurnCount(0)
  }

  return (
    <div className="scanline min-h-screen flex flex-col">
      <header className="border-b border-rambo-border px-6 py-3 flex items-center justify-between bg-rambo-card/50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <SettrAvatar size={32} />
          <span className="text-rambo-green font-bold text-sm">SETT3R</span>
          <span className="text-rambo-dim text-xs">// BUILDER v0.1</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className={statusColor}>{statusLabel}</span>
          <span className="text-rambo-dim">SCORE: {score}/100</span>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-[260px_1fr_380px] overflow-hidden">
        {/* LEFT */}
        <aside className="border-r border-rambo-border p-4 overflow-y-auto bg-rambo-card/30">
          <h2 className="text-rambo-green text-xs tracking-widest mb-4 uppercase">Build Steps</h2>
          <ul className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${step.done ? 'bg-rambo-green' : 'bg-rambo-border'}`} />
                <span className={step.done ? 'text-rambo-green' : 'text-rambo-dim'}>{step.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <div className="text-xs text-rambo-dim mb-1">READINESS</div>
            <div className="w-full h-3 bg-rambo-border rounded overflow-hidden">
              <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${score}%` }} />
            </div>
            <div className={`text-xs mt-1 ${statusColor}`}>{score}%</div>
          </div>

          <button
            disabled={score < 80}
            onClick={() => setShowBooking(true)}
            className={`mt-6 w-full py-2 rounded text-xs font-bold tracking-wider transition-all duration-200 ${
              score >= 80
                ? 'bg-rambo-green text-rambo-bg cursor-pointer hover:shadow-[0_0_20px_#39ff14]'
                : 'bg-rambo-border text-rambo-dim cursor-not-allowed'
            }`}
          >
            {score >= 80 ? 'BOOK ONBOARDING >>' : 'LOCKED - COMPLETE STEPS'}
          </button>

          <p className="text-[10px] text-rambo-dim mt-2 leading-relaxed">
            Complete all build steps to unlock onboarding. Score must be 80+.
          </p>
        </aside>

        {/* MIDDLE */}
        <main className="p-6 overflow-y-auto">
          <h2 className="text-rambo-green text-xs tracking-widest mb-4 uppercase">Configure Setter</h2>

          <div className="space-y-5 max-w-xl">
            <div>
              <label className="block text-xs text-rambo-dim mb-1">BUSINESS NAME</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Peak Performance Studio"
                className="w-full bg-rambo-bg border border-rambo-border rounded px-3 py-2 text-sm text-rambo-text focus:border-rambo-green focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-rambo-dim mb-1">TARGET AUDIENCE</label>
              <input
                type="text"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                placeholder="e.g. Small business owners looking for more clients"
                className="w-full bg-rambo-bg border border-rambo-border rounded px-3 py-2 text-sm text-rambo-text focus:border-rambo-green focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-rambo-dim mb-2">PERSONALITY</label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITIES.map(p => (
                  <button
                    key={p}
                    onClick={() => setPersonality(p)}
                    className={`px-3 py-1 rounded text-xs border transition-all duration-200 cursor-pointer ${
                      personality === p
                        ? 'border-rambo-green bg-rambo-green/10 text-rambo-green'
                        : 'border-rambo-border text-rambo-dim hover:border-rambo-dim'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-rambo-dim mb-1">SYSTEM PROMPT</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={10}
                className="w-full bg-rambo-bg border border-rambo-border rounded px-3 py-2 text-xs text-rambo-text focus:border-rambo-green focus:outline-none transition-colors leading-relaxed resize-y"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                className="bg-rambo-green text-rambo-bg px-5 py-2 rounded text-xs font-bold tracking-wider hover:shadow-[0_0_15px_#39ff14] transition-all duration-200 cursor-pointer"
              >
                GENERATE CONFIG
              </button>
              <button
                onClick={handleSave}
                className="border border-rambo-border text-rambo-dim px-5 py-2 rounded text-xs tracking-wider hover:border-rambo-green hover:text-rambo-green transition-all duration-200 cursor-pointer"
              >
                {saved ? 'SAVED' : 'SAVE DRAFT'}
              </button>
            </div>

            {jsonPreview && (
              <div className="mt-4">
                <label className="block text-xs text-rambo-dim mb-1">WORKFLOW CONFIG</label>
                <pre className="bg-rambo-bg border border-rambo-border rounded p-4 text-xs text-rambo-green overflow-x-auto">
                  {JSON.stringify(jsonPreview, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT */}
        <aside className="border-l border-rambo-border flex flex-col bg-rambo-card/30">
          <div className="p-4 border-b border-rambo-border">
            <h2 className="text-rambo-green text-xs tracking-widest mb-3 uppercase">Chat Simulator</h2>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-rambo-dim">SCENARIO:</label>
              <select
                value={scenario}
                onChange={e => { setScenario(e.target.value); resetChat() }}
                className="bg-rambo-bg border border-rambo-border rounded px-2 py-1 text-xs text-rambo-text focus:border-rambo-green focus:outline-none cursor-pointer flex-1"
              >
                {Object.entries(SCENARIOS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <button
                onClick={resetChat}
                className="text-rambo-dim text-[10px] border border-rambo-border px-2 py-1 rounded hover:border-rambo-red hover:text-rambo-red transition-colors cursor-pointer"
              >
                RESET
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-rambo-dim text-xs text-center mt-8">
                Send a message to test SETT3R's responses.
                <br />
                Personality: <span className="text-rambo-green">{personality}</span>
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-rambo-border text-rambo-text'
                      : 'bg-rambo-green/10 border border-rambo-green/30 text-rambo-text'
                  }`}>
                    {msg.role === 'bot' && (
                      <div className="flex items-center gap-1 mb-1">
                        <SettrAvatar size={14} />
                        <span className="text-rambo-green text-[10px] font-bold">SETT3R</span>
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
                {msg.role === 'bot' && (
                  <div className="flex gap-2 mt-1 ml-1">
                    <span className="text-[9px] text-rambo-amber">Action: {msg.action}</span>
                    <span className="text-[9px] text-rambo-purple">Tag: {msg.tag}</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-rambo-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type as lead..."
                className="flex-1 bg-rambo-bg border border-rambo-border rounded px-3 py-2 text-xs text-rambo-text focus:border-rambo-green focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="bg-rambo-green text-rambo-bg px-4 py-2 rounded text-xs font-bold hover:shadow-[0_0_10px_#39ff14] transition-all cursor-pointer"
              >
                SEND
              </button>
            </div>
            <div className="text-[10px] text-rambo-dim mt-1">
              Turn: {turnCount} // Scenario: {SCENARIOS[scenario].label}
            </div>
          </div>
        </aside>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowBooking(false)}>
          <div className="bg-rambo-card border border-rambo-green rounded-lg p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <SettrAvatar size={40} />
              <div>
                <h3 className="text-rambo-green font-bold text-sm">ONBOARDING UNLOCKED</h3>
                <p className="text-rambo-dim text-xs">Readiness score: {score}/100</p>
              </div>
            </div>
            <div className="border border-rambo-border rounded p-4 mb-4 text-xs text-rambo-text space-y-2">
              <p><span className="text-rambo-green">$&gt;</span> Business: {businessName || 'Not set'}</p>
              <p><span className="text-rambo-green">$&gt;</span> Audience: {targetAudience || 'Not set'}</p>
              <p><span className="text-rambo-green">$&gt;</span> Personality: {personality}</p>
              <p><span className="text-rambo-green">$&gt;</span> Chat turns tested: {turnCount}</p>
            </div>
            <p className="text-xs text-rambo-dim mb-4">
              Your SETT3R config is ready for deployment. Book a 15-minute onboarding call to go live.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-rambo-green text-rambo-bg py-2 rounded text-xs font-bold tracking-wider hover:shadow-[0_0_20px_#39ff14] transition-all cursor-pointer"
                onClick={() => setShowBooking(false)}
              >
                BOOK CALL
              </button>
              <button
                className="border border-rambo-border text-rambo-dim py-2 px-4 rounded text-xs hover:border-rambo-dim transition-colors cursor-pointer"
                onClick={() => setShowBooking(false)}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
