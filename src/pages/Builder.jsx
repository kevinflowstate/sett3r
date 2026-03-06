import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SettrAvatar from '../components/SettrAvatar'

const PERSONALITIES = ['Direct', 'Warm', 'Funny', 'Professional', 'Luxury']

const DEFAULT_QUESTIONS = [
  "What's the main goal you're looking to achieve?",
  "Have you tried anything before for this?",
  "What's your timeline - are you looking to start soon?",
]

function buildPrompt(businessName, targetAudience, personality, questions, neverSay) {
  const biz = businessName || '[Business Name]'
  const audience = targetAudience || '[Target Audience]'
  const tone = personality || 'Direct'
  const qs = questions.filter(q => q.trim())
  const banned = neverSay.split('\n').map(s => s.replace(/^["']|["']$/g, '').trim()).filter(Boolean)

  return `You are an AI appointment setter for ${biz}.
Your personality is ${tone}.
Your goal: qualify leads and book them into a consultation.

About the business:
${audience}

Rules:
- Never be pushy. Mirror their energy.
- Ask max ${qs.length} qualifying question${qs.length !== 1 ? 's' : ''} before offering a booking.
- If unqualified, gracefully exit and tag appropriately.
- Always confirm date/time before booking.

Qualifying questions:
${qs.map((q, i) => `${i + 1}. ${q}`).join('\n')}${banned.length > 0 ? `

Never say:
${banned.map(b => `- "${b}"`).join('\n')}` : ''}`
}

const DEFAULT_FOLLOWUPS = [
  { delay: '2 hours', message: "Hey {{firstName}}, just following up - did you get a chance to think about what we discussed? Happy to answer any questions." },
  { delay: '24 hours', message: "Hey {{firstName}}, just a quick nudge on this. If you're still interested, I can get you booked in for a quick call this week. No pressure either way." },
  { delay: '3 days', message: "Last one from me on this {{firstName}} - if the timing isn't right, totally understand. But if you'd still like to chat, just reply and I'll sort a time." },
]

const DELAY_OPTIONS = ['30 mins', '1 hour', '2 hours', '4 hours', '12 hours', '24 hours', '2 days', '3 days', '5 days', '7 days']

const DEFAULT_NEVER_SAY = `"You're a rockstar!"
"Totally amazeballs!"
"Just circle back on that"
"Let's touch base"
"Super excited!!!"
"No worries at all!!!"`

function detectIntent(message) {
  const lower = message.toLowerCase()
  if (/how much|price|cost|rates?|afford|budget|pay|expensive|cheap/i.test(lower))
    return 'price'
  if (/busy|quick|short|hurry|no time|later|not now/i.test(lower))
    return 'busy'
  if (/not (sure|ready|interested)|maybe later|just looking|browsing/i.test(lower))
    return 'cold'
  if (/book|appointment|schedule|slot|available|sign up|start/i.test(lower))
    return 'booking'
  if (/what do you|how does|tell me|info|more about|explain|details/i.test(lower))
    return 'curious'
  if (/hi|hey|hello|yo|sup|morning|afternoon/i.test(lower))
    return 'greeting'
  return 'general'
}

function generateReply(personality, businessName, questions, message, turnCount, history) {
  const biz = businessName || 'our team'
  const tone = personality || 'Direct'
  const intent = detectIntent(message)

  const greetings = {
    Direct: `Hey. Thanks for reaching out to ${biz}.`,
    Warm: `Hey there! So glad you messaged ${biz}. I'd love to help you out.`,
    Funny: `Well well well... look who slid into ${biz}'s DMs. Love it.`,
    Professional: `Thanks for getting in touch with ${biz}. Happy to help.`,
    Luxury: `Welcome. You've connected with ${biz}. Let's see if we're the right fit.`,
  }

  // First message always gets a greeting
  if (turnCount === 0) {
    const q = questions[0] || "What's the main goal you're looking to achieve?"
    return {
      text: `${greetings[tone]} Quick question - ${q.toLowerCase().replace(/\?$/, '')}?`,
      action: 'qualify_q1',
    }
  }

  // Price intent
  if (intent === 'price') {
    return {
      text: `Totally get it - price matters. Before I throw numbers at you though, can I ask what you're actually looking to achieve? That way I can tell you exactly what you'd get for the investment.`,
      action: 'handle_objection',
    }
  }

  // Busy / short replies
  if (intent === 'busy') {
    return {
      text: `No worries, I'll keep it quick. The easiest next step is a 15-min call with ${biz} - no pressure, just a quick chat to see if we can help. Want me to find you a slot?`,
      action: 'offer_booking',
    }
  }

  // Cold / not interested
  if (intent === 'cold') {
    return {
      text: `Completely understand - no pressure at all. If anything changes or you want to pick this up later, just message back anytime. The door's always open.`,
      action: 'soft_exit',
    }
  }

  // Booking intent
  if (intent === 'booking') {
    return {
      text: `Brilliant - let's get you sorted. I can book you in for a quick 15-minute discovery call with ${biz}. What day works best for you this week?`,
      action: 'book_appointment',
    }
  }

  // Curious / wants info
  if (intent === 'curious') {
    const q = questions[Math.min(turnCount, questions.length - 1)] || "What's your timeline - are you looking to start soon?"
    return {
      text: `Great question! I can definitely help with that. Just so I can point you in the right direction - ${q.toLowerCase().replace(/\?$/, '')}?`,
      action: `qualify_q${Math.min(turnCount + 1, questions.length)}`,
    }
  }

  // General / follow-up - cycle through qualifying questions
  if (turnCount <= questions.length) {
    const qIdx = Math.min(turnCount, questions.length - 1)
    const q = questions[qIdx]
    return {
      text: `Got it, thanks for sharing that. ${turnCount < questions.length ? q : `You sound like a great fit. The next step is a quick discovery call with ${biz} - no pressure, just a conversation. Want me to find you a slot this week?`}`,
      action: turnCount < questions.length ? `qualify_q${turnCount + 1}` : 'offer_booking',
    }
  }

  // Past qualifying questions - push toward booking
  return {
    text: `Based on everything you've told me, I think we can definitely help. The best next step is a quick 15-min call with ${biz}. Want me to get you booked in?`,
    action: 'offer_booking',
  }
}

export default function Builder() {
  const navigate = useNavigate()
  const chatEndRef = useRef(null)

  const [businessName, setBusinessName] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [personality, setPersonality] = useState('Direct')
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS)
  const [followups, setFollowups] = useState(DEFAULT_FOLLOWUPS)
  const [neverSay, setNeverSay] = useState(DEFAULT_NEVER_SAY)
  const [jsonPreview, setJsonPreview] = useState(null)
  const [saved, setSaved] = useState(false)

  const generatedPrompt = buildPrompt(businessName, targetAudience, personality, questions, neverSay)

  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([])
  const [turnCount, setTurnCount] = useState(0)

  const [score, setScore] = useState(0)
  const [showBooking, setShowBooking] = useState(false)

  const steps = [
    { label: 'Business name', done: businessName.length > 2 },
    { label: 'Target audience', done: targetAudience.length > 10 },
    { label: 'Personality selected', done: !!personality },
    { label: 'Qualifying questions', done: questions.some(q => q.trim()) },
    { label: 'Follow-ups configured', done: followups.some(f => f.message.trim()) },
    { label: 'Never say configured', done: neverSay.trim().length > 0 },
    { label: 'Config generated', done: !!jsonPreview },
    { label: 'Chat tested (3+ turns)', done: turnCount >= 3 },
  ]

  useEffect(() => {
    let s = 0
    if (businessName.length > 2) s += 15
    if (targetAudience.length > 10) s += 15
    if (personality) s += 10
    if (questions.some(q => q.trim())) s += 10
    if (followups.some(f => f.message.trim())) s += 5
    if (neverSay.trim().length > 0) s += 5
    if (jsonPreview) s += 20
    s += Math.min(turnCount * 5, 25)
    setScore(Math.min(s, 100))
  }, [businessName, targetAudience, personality, questions, followups, neverSay, jsonPreview, turnCount])

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
      qualifying_questions: questions.filter(q => q.trim()),
      never_say: neverSay.split('\n').map(s => s.replace(/^["']|["']$/g, '').trim()).filter(Boolean),
      followups: followups.filter(f => f.message.trim()).map(f => ({ delay: f.delay, message: f.message })),
      channels: ['instagram_dm', 'sms'],
      booking_integration: 'calendly',
      prompt_hash: btoa(generatedPrompt).slice(0, 12),
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
    const reply = generateReply(personality, businessName, questions, chatInput, turnCount, messages)
    const botMsg = { role: 'bot', text: reply.text, action: reply.action }

    setMessages(prev => [...prev, userMsg, botMsg])
    setChatInput('')
    setTurnCount(prev => prev + 1)
  }

  function resetChat() {
    setMessages([])
    setTurnCount(0)
  }

  function updateQuestion(idx, value) {
    setQuestions(prev => prev.map((q, i) => i === idx ? value : q))
  }

  function addQuestion() {
    if (questions.length < 5) setQuestions(prev => [...prev, ''])
  }

  function removeQuestion(idx) {
    if (questions.length > 1) setQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  function updateFollowup(idx, field, value) {
    setFollowups(prev => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f))
  }

  function addFollowup() {
    if (followups.length < 5) setFollowups(prev => [...prev, { delay: '24 hours', message: '' }])
  }

  function removeFollowup(idx) {
    if (followups.length > 1) setFollowups(prev => prev.filter((_, i) => i !== idx))
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
              <label className="block text-xs text-rambo-dim mb-1">ABOUT YOUR BUSINESS & AUDIENCE</label>
              <textarea
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                rows={5}
                placeholder="Tell us everything about your business & who you sell to. The more detail, the better SETT3R performs. What do you offer? Who's your ideal client? What problems do you solve?"
                className="w-full bg-rambo-bg border border-rambo-border rounded px-3 py-2 text-sm text-rambo-text focus:border-rambo-green focus:outline-none transition-colors leading-relaxed resize-y"
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
              <label className="block text-xs text-rambo-dim mb-2">QUALIFYING QUESTIONS</label>
              <p className="text-[10px] text-rambo-dim mb-2">SETT3R asks these before offering a booking. Drag to reorder.</p>
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-rambo-green text-xs w-4">{i + 1}.</span>
                    <input
                      type="text"
                      value={q}
                      onChange={e => updateQuestion(i, e.target.value)}
                      placeholder="e.g. What's your main goal?"
                      className="flex-1 bg-rambo-bg border border-rambo-border rounded px-3 py-1.5 text-xs text-rambo-text focus:border-rambo-green focus:outline-none"
                    />
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(i)}
                        className="text-rambo-dim hover:text-rambo-red text-xs cursor-pointer px-1"
                      >
                        x
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {questions.length < 5 && (
                <button
                  onClick={addQuestion}
                  className="mt-2 text-[10px] text-rambo-green hover:text-rambo-green/80 cursor-pointer"
                >
                  + Add question
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs text-rambo-dim mb-1">NEVER SAY</label>
              <p className="text-[10px] text-rambo-dim mb-2">Phrases your SETT3R should never use. One per line.</p>
              <textarea
                value={neverSay}
                onChange={e => setNeverSay(e.target.value)}
                rows={5}
                placeholder={`"You're a rockstar!"\n"Totally amazeballs!"\n"Let's touch base"`}
                className="w-full bg-rambo-bg border border-rambo-border rounded px-3 py-2 text-xs text-rambo-text focus:border-rambo-green focus:outline-none transition-colors leading-relaxed resize-y"
              />
            </div>

            <div>
              <label className="block text-xs text-rambo-dim mb-2">FOLLOW-UPS</label>
              <p className="text-[10px] text-rambo-dim mb-2">If a lead goes quiet, SETT3R sends these automatically. Use {"{{firstName}}"} to personalise.</p>
              <div className="space-y-3">
                {followups.map((f, i) => (
                  <div key={i} className="border border-rambo-border rounded p-3 bg-rambo-bg/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-rambo-green text-xs">#{i + 1}</span>
                      <span className="text-[10px] text-rambo-dim">Send after</span>
                      <select
                        value={f.delay}
                        onChange={e => updateFollowup(i, 'delay', e.target.value)}
                        className="bg-rambo-bg border border-rambo-border rounded px-2 py-1 text-xs text-rambo-text focus:border-rambo-green focus:outline-none cursor-pointer"
                      >
                        {DELAY_OPTIONS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <span className="text-[10px] text-rambo-dim">of no reply</span>
                      {followups.length > 1 && (
                        <button
                          onClick={() => removeFollowup(i)}
                          className="ml-auto text-rambo-dim hover:text-rambo-red text-xs cursor-pointer px-1"
                        >
                          x
                        </button>
                      )}
                    </div>
                    <textarea
                      value={f.message}
                      onChange={e => updateFollowup(i, 'message', e.target.value)}
                      rows={2}
                      placeholder="e.g. Hey {{firstName}}, just checking in - still interested?"
                      className="w-full bg-rambo-bg border border-rambo-border rounded px-3 py-1.5 text-xs text-rambo-text focus:border-rambo-green focus:outline-none leading-relaxed resize-y"
                    />
                  </div>
                ))}
              </div>
              {followups.length < 5 && (
                <button
                  onClick={addFollowup}
                  className="mt-2 text-[10px] text-rambo-green hover:text-rambo-green/80 cursor-pointer"
                >
                  + Add follow-up
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs text-rambo-dim mb-1">GENERATED PROMPT PREVIEW</label>
              <p className="text-[10px] text-rambo-dim mb-2">This builds automatically from your inputs above. This is what SETT3R uses to respond.</p>
              <pre className="w-full bg-rambo-bg border border-rambo-border rounded px-3 py-2 text-xs text-rambo-green/80 leading-relaxed whitespace-pre-wrap">{generatedPrompt}</pre>
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
          <div className="p-4 border-b border-rambo-border flex items-center justify-between">
            <h2 className="text-rambo-green text-xs tracking-widest uppercase">Chat Simulator</h2>
            <button
              onClick={resetChat}
              className="text-rambo-dim text-[10px] border border-rambo-border px-2 py-1 rounded hover:border-rambo-red hover:text-rambo-red transition-colors cursor-pointer"
            >
              RESET
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center mt-8">
                <p className="text-rambo-dim text-xs mb-2">
                  Type anything a lead might say.
                </p>
                <p className="text-rambo-dim text-[10px]">
                  SETT3R will respond based on your config.
                </p>
                <div className="mt-4 space-y-1">
                  {['"How much is it?"', '"Hey, I saw your post"', '"I\'m interested but busy"', '"What do you offer?"'].map((hint, i) => (
                    <button
                      key={i}
                      onClick={() => { setChatInput(hint.replace(/"/g, '')); }}
                      className="block mx-auto text-[10px] text-rambo-purple hover:text-rambo-green cursor-pointer transition-colors"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
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
                placeholder="Type as a lead..."
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
              Turn: {turnCount} // Personality: {personality}
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
              <p><span className="text-rambo-green">$&gt;</span> Personality: {personality}</p>
              <p><span className="text-rambo-green">$&gt;</span> Questions: {questions.filter(q => q.trim()).length}</p>
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
