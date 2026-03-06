import { useState, useRef, useEffect } from 'react'
import SettrAvatar from './SettrAvatar'

const RESPONSES = [
  {
    triggers: ['hey', 'hi', 'hello', 'yo', 'sup', 'what\'s up'],
    reply: "Hey! Thanks for checking out SETT3R. Are you currently using a VA or handling lead follow-up yourself?",
    action: 'greeting',
  },
  {
    triggers: ['price', 'cost', 'how much', 'pricing', 'expensive', 'afford', 'budget'],
    reply: "Good question. SETT3R starts at \u00A3297/mo - that's less than a single day of a VA's monthly salary. And SETT3R works 24/7, never forgets a follow-up, and handles unlimited conversations. Want me to break down what's included at each tier?",
    action: 'pricing_inquiry',
  },
  {
    triggers: ['va', 'virtual assistant', 'assistant', 'hire', 'staff'],
    reply: "Here's the thing about VAs - they cost \u00A31,200-2,000/mo, work 8 hours, handle maybe 20-30 conversations a day, take holidays, and still need managing. SETT3R runs 24/7, handles unlimited conversations simultaneously, never forgets a follow-up, and costs a fraction. What does your current setup look like?",
    action: 'va_comparison',
  },
  {
    triggers: ['how', 'work', 'what do', 'explain', 'tell me'],
    reply: "Simple. You tell SETT3R about your business, your ideal client, and how you want to sound. SETT3R handles every inbound lead - qualifies them, handles objections, and books them straight into your calendar. Instagram DMs, SMS, email, webchat - all from one brain. Want to see it in action? Try asking me something a lead would ask.",
    action: 'explanation',
  },
  {
    triggers: ['book', 'call', 'demo', 'start', 'sign up', 'get started', 'interested', 'ready'],
    reply: "Let's go. The onboarding process is dead simple - you jump on a 15-minute call, we connect your socials, and SETT3R goes live the same day. No tech skills needed. Want me to find you a slot this week?",
    action: 'booking_intent',
  },
  {
    triggers: ['channel', 'instagram', 'sms', 'email', 'whatsapp', 'facebook', 'dm'],
    reply: "SETT3R works across Instagram DMs, SMS, email, webchat, Facebook Messenger, and WhatsApp. Same personality, same brain, every channel. Your leads get a consistent experience no matter where they reach out. Which channels are you using right now?",
    action: 'channel_inquiry',
  },
  {
    triggers: ['no show', 'no-show', 'ghost', 'cancel', 'miss'],
    reply: "No-shows are money left on the table. SETT3R automatically follows up within 10 minutes of a missed appointment - 'Hey, noticed you couldn't make it. Want to rebook?' Most businesses recover 30-40% of no-shows this way. Your VA probably just marks them as lost.",
    action: 'noshow_feature',
  },
  {
    triggers: ['lead', 'leads', 'follow up', 'follow-up', 'response', 'speed'],
    reply: "Speed-to-lead is everything. The average business takes 47 minutes to respond to a new inquiry. By then, the lead's already talking to your competitor. SETT3R responds in under 5 seconds. Every time. 24/7. That alone can double your booking rate.",
    action: 'speed_to_lead',
  },
  {
    triggers: ['review', 'testimonial', 'google', 'trustpilot'],
    reply: "SETT3R's Commander tier includes automatic review harvesting. After every appointment, it sends a 'How was your experience?' message. Positive responses get routed to Google or Trustpilot. Negative ones get flagged internally so you can fix them before they go public. Autopilot reputation management.",
    action: 'review_feature',
  },
  {
    triggers: ['ai', 'robot', 'fake', 'real', 'human', 'sound', 'natural'],
    reply: "SETT3R is trained to match YOUR brand voice. Direct, warm, funny, premium - whatever fits your business. Leads genuinely can't tell the difference. And if a conversation ever needs a human touch, SETT3R escalates to you instantly with full context. You're always in control.",
    action: 'ai_concern',
  },
  {
    triggers: ['salon', 'beauty', 'spa', 'clinic', 'gym', 'fitness', 'coach', 'dentist', 'physio', 'trade', 'plumber', 'builder', 'accountant', 'lawyer'],
    reply: "SETT3R works for any service business that books appointments - salons, clinics, trades, professional services, coaching, wellness, you name it. If you've got leads coming in and a calendar to fill, SETT3R fits right in. What kind of business are you running?",
    action: 'industry_match',
  },
]

const FALLBACK_REPLIES = [
  "Interesting. Here's what I'd say to that as your AI setter - every lead gets a response in under 5 seconds, qualified in 3 questions, and booked straight into your calendar. No humans needed. Want to see how it works for your specific business?",
  "I like the direct approach. That's actually how SETT3R works too - no fluff, straight to qualifying and booking. The businesses using it are seeing 2-3x more appointments from the same lead flow. What's your current show rate looking like?",
  "Good stuff. Most business owners I talk to are drowning in leads they can't follow up fast enough. SETT3R fixes that - instant response, every channel, 24/7. The real question is: how many leads are you losing right now because nobody replied in time?",
]

function findResponse(message) {
  const lower = message.toLowerCase()
  for (const r of RESPONSES) {
    if (r.triggers.some(t => lower.includes(t))) {
      return { text: r.reply, action: r.action }
    }
  }
  return {
    text: FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)],
    action: 'general',
  }
}

export default function SettrChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "I'm SETT3R. I do what your VA does - except I don't sleep, don't forget, and I was already typing before they found the charger. Ask me anything, or talk to me like a lead would.",
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  function handleSend() {
    if (!input.trim() || isTyping) return
    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const delay = 800 + Math.random() * 1200
    setTimeout(() => {
      const response = findResponse(userMsg.text)
      setMessages(prev => [...prev, { role: 'bot', text: response.text, action: response.action }])
      setIsTyping(false)
    }, delay)
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
          isOpen
            ? 'bg-rambo-border hover:bg-rambo-card'
            : 'bg-rambo-green hover:shadow-[0_0_30px_#39ff14]'
        }`}
        style={{ boxShadow: isOpen ? 'none' : '0 0 20px rgba(57,255,20,0.3)' }}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c0c0d0" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <SettrAvatar size={36} />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[560px] flex flex-col bg-rambo-card border border-rambo-border rounded-lg shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 2px rgba(57,255,20,0.2)' }}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-rambo-border flex items-center gap-3 bg-rambo-bg">
            <SettrAvatar size={28} />
            <div className="flex-1">
              <div className="text-rambo-green text-xs font-bold tracking-wider">SETT3R</div>
              <div className="text-[10px] text-rambo-dim">AI Setter // Always Online</div>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rambo-green animate-pulse" />
              <span className="text-[10px] text-rambo-green">LIVE</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-rambo-border text-rambo-text rounded-br-sm'
                    : 'bg-rambo-green/8 border border-rambo-green/20 text-rambo-text rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-rambo-green/8 border border-rambo-green/20 rounded-lg rounded-bl-sm px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-rambo-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-rambo-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-rambo-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-rambo-border bg-rambo-bg">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask SETT3R anything..."
                className="flex-1 bg-rambo-card border border-rambo-border rounded px-3 py-2 text-xs text-rambo-text focus:border-rambo-green focus:outline-none placeholder:text-rambo-dim/50"
              />
              <button
                onClick={handleSend}
                disabled={isTyping}
                className="bg-rambo-green text-rambo-bg px-3 py-2 rounded text-xs font-bold hover:shadow-[0_0_10px_#39ff14] transition-all cursor-pointer disabled:opacity-50"
              >
                SEND
              </button>
            </div>
            <div className="text-[9px] text-rambo-dim/50 mt-1.5 text-center">
              This is SETT3R in demo mode. Your version will match your brand voice.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
