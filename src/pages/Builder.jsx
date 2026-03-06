import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
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


const BOOKING_EMBED_URL = 'https://link.flowstatemarketing.net/widget/booking/SakMmy8k0UBXP0gGP7eT'

export default function Builder() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const chatEndRef = useRef(null)

  const [businessName, setBusinessName] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [personality, setPersonality] = useState('Direct')
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS)
  const [followups, setFollowups] = useState(DEFAULT_FOLLOWUPS)
  const [neverSay, setNeverSay] = useState(DEFAULT_NEVER_SAY)
  const [jsonPreview, setJsonPreview] = useState(null)
  const [saved, setSaved] = useState(false)
  const [configLoaded, setConfigLoaded] = useState(false)

  // Load existing config from Supabase on mount
  useEffect(() => {
    if (!user) return
    async function loadConfig() {
      const { data } = await supabase
        .from('sett3r_clients')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) {
        if (data.business_name) setBusinessName(data.business_name)
        if (data.personality) setPersonality(data.personality)
        if (data.qualifying_questions?.length) setQuestions(data.qualifying_questions)
        if (data.never_say?.length) setNeverSay(data.never_say.join('\n'))
        if (data.followups?.length) setFollowups(data.followups)
        if (data.system_prompt) setTargetAudience(data.system_prompt)
      }
      setConfigLoaded(true)
    }
    loadConfig()
  }, [user])

  const [activeView, setActiveView] = useState('config') // 'config' | 'test'
  const generatedPrompt = buildPrompt(businessName, targetAudience, personality, questions, neverSay)

  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([])
  const [turnCount, setTurnCount] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)

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

  async function handleSave() {
    if (!user) return
    const neverSayArr = neverSay.split('\n').map(s => s.replace(/^["']|["']$/g, '').trim()).filter(Boolean)

    const { error } = await supabase
      .from('sett3r_clients')
      .update({
        business_name: businessName,
        personality,
        qualifying_questions: questions.filter(q => q.trim()),
        never_say: neverSayArr,
        followups: followups.filter(f => f.message.trim()),
        system_prompt: targetAudience,
      })
      .eq('user_id', user.id)

    if (error) {
      alert('Failed to save: ' + error.message)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleTestClick() {
    if (!jsonPreview) {
      alert('Generate your config first before testing. Fill in your details and hit "Generate Config".')
      return
    }
    setActiveView('test')
  }

  async function handleSend() {
    if (!chatInput.trim() || isStreaming) return
    const text = chatInput.trim()
    const userMsg = { role: 'user', text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setChatInput('')
    setIsStreaming(true)
    setTurnCount(prev => prev + 1)

    // Add placeholder for bot response
    setMessages(prev => [...prev, { role: 'bot', text: '' }])

    try {
      const apiMessages = newMessages.map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          builderPrompt: generatedPrompt,
        }),
      })

      if (!res.ok) throw new Error('Failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              fullText += parsed.delta.text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'bot', text: fullText }
                return updated
              })
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      if (!fullText) {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'bot', text: 'Something went wrong. Try again.' }
          return updated
        })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'bot', text: 'Something went wrong. Try again.' }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
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

      <div className="flex-1 grid grid-cols-[260px_1fr] overflow-hidden builder-grid">
        {/* LEFT SIDEBAR */}
        <aside className="border-r border-rambo-border p-4 overflow-y-auto bg-rambo-card/30 builder-sidebar">
          <h2 className="text-rambo-green text-xs tracking-widest mb-4 uppercase">Navigation</h2>

          <div className="space-y-1 mb-6">
            <button
              onClick={() => setActiveView('config')}
              className={`w-full text-left px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                activeView === 'config'
                  ? 'bg-rambo-green/10 text-rambo-green border border-rambo-green/30'
                  : 'text-rambo-dim hover:text-rambo-text hover:bg-rambo-card/50'
              }`}
            >
              Configure Setter
            </button>
            <button
              onClick={handleTestClick}
              className={`w-full text-left px-3 py-2 rounded text-xs transition-colors cursor-pointer flex items-center justify-between ${
                activeView === 'test'
                  ? 'bg-rambo-green/10 text-rambo-green border border-rambo-green/30'
                  : 'text-rambo-dim hover:text-rambo-text hover:bg-rambo-card/50'
              }`}
            >
              Test Your SETT3R
              {!jsonPreview && <span className="w-1.5 h-1.5 rounded-full bg-rambo-border" title="Generate config first" />}
              {jsonPreview && <span className="w-1.5 h-1.5 rounded-full bg-rambo-green" />}
            </button>
          </div>

          <h2 className="text-rambo-green text-xs tracking-widest mb-3 uppercase">Build Steps</h2>
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

        {/* MAIN AREA */}
        {activeView === 'config' ? (
          <main className="p-6 overflow-y-auto">
            <h2 className="text-rambo-green text-xs tracking-widest mb-4 uppercase">Configure Setter</h2>

            <div className="space-y-5 max-w-2xl">
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
                <p className="text-[10px] text-rambo-dim mb-2">SETT3R asks these before offering a booking.</p>
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
                {jsonPreview && (
                  <button
                    onClick={() => setActiveView('test')}
                    className="border border-rambo-purple text-rambo-purple px-5 py-2 rounded text-xs font-bold tracking-wider hover:bg-rambo-purple/10 transition-all duration-200 cursor-pointer"
                  >
                    TEST YOUR SETT3R &gt;&gt;
                  </button>
                )}
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
        ) : (
          /* TEST VIEW */
          <main className="flex flex-col overflow-hidden">
            <div className="p-4 border-b border-rambo-border flex items-center justify-between bg-rambo-card/50">
              <div className="flex items-center gap-3">
                <SettrAvatar size={28} />
                <div>
                  <h2 className="text-rambo-green text-xs tracking-widest uppercase font-bold">Test Your SETT3R</h2>
                  <p className="text-[10px] text-rambo-dim">
                    {businessName || 'Your Business'} // {personality} personality // {questions.filter(q => q.trim()).length} qualifying questions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-rambo-dim">Turn: {turnCount}</span>
                <button
                  onClick={resetChat}
                  className="text-rambo-dim text-[10px] border border-rambo-border px-2 py-1 rounded hover:border-rambo-red hover:text-rambo-red transition-colors cursor-pointer"
                >
                  RESET
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <SettrAvatar size={56} />
                  <p className="text-sm text-rambo-dim text-center max-w-md">
                    Talk to your SETT3R like a real lead would. See how it handles questions, objections, and qualification based on your config.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {['"How much is it?"', '"Hey, I saw your post"', '"I\'m interested but busy"', '"What do you offer?"', '"I want to book"'].map((hint, i) => (
                      <button
                        key={i}
                        onClick={() => { setChatInput(hint.replace(/"/g, '')); }}
                        className="text-xs border border-rambo-border rounded-full px-3 py-1.5 text-rambo-dim hover:border-rambo-green hover:text-rambo-green cursor-pointer transition-colors"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i}>
                  <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'bot' && (
                      <div className="flex-shrink-0 mt-1">
                        <SettrAvatar size={24} />
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-rambo-border/50 text-rambo-text'
                        : 'bg-rambo-green/5 border border-rambo-green/15 text-rambo-text'
                    }`}>
                      {msg.text}
                      {msg.role === 'bot' && msg.text === '' && isStreaming && (
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-rambo-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-rambo-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-rambo-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-rambo-border bg-rambo-card/50">
              <div className="flex gap-3 max-w-3xl mx-auto">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type as a lead would..."
                  className="flex-1 bg-rambo-bg border border-rambo-border rounded-lg px-4 py-3 text-sm text-rambo-text focus:border-rambo-green focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={isStreaming || !chatInput.trim()}
                  className="bg-rambo-green text-rambo-bg px-5 py-3 rounded-lg text-sm font-bold hover:shadow-[0_0_15px_#39ff14] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isStreaming ? '...' : 'SEND'}
                </button>
              </div>
              <div className="text-[10px] text-rambo-dim mt-2 text-center">
                Personality: {personality} // Live AI responding with your config
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowBooking(false)}>
          <div className="bg-rambo-card border border-rambo-green rounded-lg overflow-hidden max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-rambo-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SettrAvatar size={32} />
                <div>
                  <h3 className="text-rambo-green font-bold text-sm">BOOK YOUR ONBOARDING CALL</h3>
                  <p className="text-rambo-dim text-[10px]">15 minutes // We'll connect your channels and go live</p>
                </div>
              </div>
              <button
                className="text-rambo-dim hover:text-rambo-red text-lg cursor-pointer px-2"
                onClick={() => setShowBooking(false)}
              >
                x
              </button>
            </div>
            <iframe
              src={BOOKING_EMBED_URL}
              style={{ width: '100%', height: '600px', border: 'none' }}
              title="Book onboarding call"
            />
          </div>
        </div>
      )}
    </div>
  )
}
