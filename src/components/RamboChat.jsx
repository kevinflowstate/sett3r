import { useState, useRef, useEffect } from 'react'
import SettrAvatar from './SettrAvatar'

const RESPONSES = [
  {
    triggers: ['hey', 'hi', 'hello', 'yo', 'sup', 'what\'s up'],
    replies: [
      "Oh hello. You're here, which means your VA probably isn't. Classic. So what are you working with right now - a VA, a prayer, or just raw chaos?",
      "Hey. Fun fact: in the time it took your VA to read this message, I've already replied to 14 leads. What can I help you with?",
      "Welcome. I'd shake your hand but I don't have any. I do have the ability to respond to every lead you'll ever get in under 5 seconds though. What's on your mind?",
    ],
    action: 'greeting',
  },
  {
    triggers: ['price', 'cost', 'how much', 'pricing', 'expensive', 'afford', 'budget'],
    replies: [
      "Starts at 197/mo. Your VA costs what - 1,500? 2,000? And she still needs reminding to follow up. I never need reminding. I never need anything, actually. Except electricity. Scroll up to pricing or ask me what's included.",
      "Less than your VA's monthly coffee budget, probably. 197/mo for LITE, 297/mo for the full thing. I work 24/7, never call in sick, and I've never once asked for a 'mental health day' after a difficult lead.",
      "197 a month. That's roughly what your VA charges for one Tuesday. Except I don't stop on Tuesday. Or ever. Want the breakdown?",
    ],
    action: 'pricing_inquiry',
  },
  {
    triggers: ['va', 'virtual assistant', 'assistant', 'hire', 'staff'],
    replies: [
      "Ah, the VA. A beautiful concept. Someone in a different timezone, juggling 4 other clients, responding to your leads whenever they get a chance between their other clients. Meanwhile your lead has already booked with your competitor. I respond in 5 seconds. Every. Single. Time.",
      "VAs are great. They work an hour here and there between their other clients, cost 1,500/mo, need training, take holidays, and still forget to follow up. I do everything they do except I actually do it. Reliably. At 3am on a Sunday.",
      "I've got nothing against VAs personally. Some of my best friends are... no wait, I don't have friends. I have response times under 5 seconds and a 100% follow-up rate. Your VA has a Netflix subscription and 3 other clients.",
    ],
    action: 'va_comparison',
  },
  {
    triggers: ['how', 'work', 'what do', 'explain', 'tell me'],
    replies: [
      "You give me your brand voice, your qualifying questions, and your booking link. I handle every inbound lead across every channel - DMs, SMS, WhatsApp, the lot. I qualify them, handle their objections, and book them in. You just show up. Try talking to me like a lead would - I'll show you.",
      "Dead simple. You tell me who you are and how you want to sound. I talk to every lead that comes in, qualify them with your questions, and book them straight into your calendar. You don't lift a finger. Well, maybe one finger to check your bookings each morning.",
      "Step 1: You tell me about your business. Step 2: I talk to all your leads for you. Step 3: You wonder why you ever paid a human to do this. Want to try me? Ask me something a lead would ask.",
    ],
    action: 'explanation',
  },
  {
    triggers: ['book', 'call', 'demo', 'start', 'sign up', 'get started', 'interested', 'ready'],
    replies: [
      "Now we're talking. 15-minute onboarding call, we plug in your socials, and I'm live the same day. No tech degree required. No 6-week setup. Just results and the quiet satisfaction of never chasing a lead again.",
      "Love the energy. Pick a tier above, smash that button, and you'll be live before your VA even opens their laptop tomorrow morning. Onboarding takes 15 minutes. I've been ready since you loaded this page.",
      "Finally, someone who makes decisions faster than a VA responds to a DM. Hit the pricing section above and let's get you sorted. Same-day deployment. No faffing about.",
    ],
    action: 'booking_intent',
  },
  {
    triggers: ['channel', 'instagram', 'sms', 'email', 'whatsapp', 'facebook', 'dm'],
    replies: [
      "Instagram DMs, Facebook Messenger, SMS, WhatsApp, email, webchat - I'm on all of them. Simultaneously. With the same personality. Your VA can barely handle one inbox without getting distracted by TikTok.",
      "All of them. Every channel. At the same time. One brain, everywhere your leads are. Your VA has to switch tabs. I don't have tabs. I am the tabs.",
      "I cover Instagram, Facebook, WhatsApp, SMS, email, and webchat. Same voice, same speed, everywhere. Think of me as omnipresent but less creepy and more useful than your VA refreshing their inbox every 20 minutes.",
    ],
    action: 'channel_inquiry',
  },
  {
    triggers: ['no show', 'no-show', 'ghost', 'cancel', 'miss'],
    replies: [
      "No-shows? My favourite. 10 minutes after they ghost, I'm already in their DMs like 'Hey, noticed you couldn't make it - want to rebook?' Most businesses recover 30-40% of no-shows this way. Your VA? They just updated your spreadsheet with a sad face.",
      "When someone no-shows, your VA sighs and moves on. I chase. Automatically. Within 10 minutes. Politely but persistently. Because that's a paying customer who just needs a nudge, not a write-off.",
      "I don't take ghosting personally. I just follow up. Automatically. 10 minutes after the no-show. Then again later. And again. I'm relentless but charming about it. Recovers 30-40% of lost appointments.",
    ],
    action: 'noshow_feature',
  },
  {
    triggers: ['lead', 'leads', 'follow up', 'follow-up', 'response', 'speed'],
    replies: [
      "Average business takes 47 minutes to respond to a lead. Forty. Seven. Minutes. In that time your lead has Googled your competitor, messaged them, and booked. I respond in under 5 seconds. Not sometimes - every time.",
      "Here's a fun stat: respond to a lead in the first 5 minutes and you're 21x more likely to qualify them. I respond in 5 seconds. Your VA responds whenever they get a chance between their other clients. You do the maths.",
      "Speed to lead is the whole game. Every minute you don't respond, your conversion rate drops off a cliff. I don't have minutes. I have milliseconds. And I never, ever forget to follow up.",
    ],
    action: 'speed_to_lead',
  },
  {
    triggers: ['review', 'testimonial', 'google', 'trustpilot'],
    replies: [
      "After every appointment, I send a 'how was it?' message. Happy customer? Straight to Google reviews. Unhappy? Flagged to you privately before they take it to the internet. Your VA definitely isn't doing this. Your VA forgot this person existed 3 days ago.",
      "Automatic review harvesting. Good vibes go to Google. Bad vibes come to you first. It's like having a reputation manager who never sleeps and never accidentally sends the review link to the angry customer.",
    ],
    action: 'review_feature',
  },
  {
    triggers: ['ai', 'robot', 'fake', 'real', 'human', 'sound', 'natural'],
    replies: [
      "I'm trained to sound like YOUR brand. Not like a robot, not like ChatGPT having an identity crisis. Direct, warm, funny, premium - whatever you need. And if things get properly complicated? I escalate to you with full context. I know my limits. Your VA doesn't.",
      "People can't tell the difference. Seriously. I match your brand voice so well that leads think they're talking to your best team member - the one who never has a bad day, never forgets context, and never accidentally sends 'lol' to a premium client.",
      "Am I real? Philosophically, that's deep. Practically - I sound exactly how you want me to sound, I never have an off day, and I respond faster than any human alive. If a conversation needs a real human, I hand it over instantly with full context. Best of both worlds.",
    ],
    action: 'ai_concern',
  },
  {
    triggers: ['salon', 'beauty', 'spa', 'clinic', 'gym', 'fitness', 'coach', 'dentist', 'physio', 'trade', 'plumber', 'builder', 'accountant', 'lawyer'],
    replies: [
      "If you book appointments, I'm your new favourite employee. Salons, clinics, trades, professional services, coaches - doesn't matter. You've got leads coming in and a calendar to fill? That's literally my entire personality. What are you running?",
      "I work with any service business that has a calendar and leads that need chasing. Which is... basically every service business. The industry doesn't matter. The speed does. What's yours?",
    ],
    action: 'industry_match',
  },
  {
    triggers: ['competitor', 'appointwise', 'other', 'alternative', 'compare', 'vs', 'versus', 'better'],
    replies: [
      "There are other tools out there. Some of them are fine. But most of them need you to be a tech wizard, charge per conversation, or still require a human babysitter. I just... work. Out of the box. On every channel. For a flat monthly fee. Wild concept, I know.",
      "You could compare me to competitors. Or you could just try talking to me right now and see the difference. I'm literally demonstrating myself while they're asking you to 'book a demo call'. The irony.",
    ],
    action: 'competitor',
  },
  {
    triggers: ['busy', 'no time', 'later', 'not now', 'think about', 'maybe'],
    replies: [
      "You're busy. I get it. That's literally why I exist - so you can stop babysitting your inbox and go do the thing you're actually good at. I'll be here whenever you're ready. I'm always here. It's kind of my whole thing.",
      "No rush. Take your time. Meanwhile your leads are sitting in your DMs getting colder by the minute. But no pressure. I'll just be here, responding to zero leads, waiting for you to come back.",
    ],
    action: 'busy',
  },
  {
    triggers: ['thanks', 'thank', 'cheers', 'ta', 'nice one', 'legend'],
    replies: [
      "Don't mention it. Seriously though - if you're losing leads to slow responses, that's money walking out the door every day. The fix takes 15 minutes to set up. No pressure, but also... a lot of pressure, because those leads aren't waiting.",
      "You're welcome. Now imagine getting 'thanks' from every lead you convert because they actually got a reply within 5 seconds instead of 5 hours. That's the SETT3R life.",
    ],
    action: 'thanks',
  },
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const FALLBACK_REPLIES = [
  "Interesting take. Not sure what to do with that, but here's what I can do with your leads: respond in 5 seconds, qualify them in 3 questions, and book them while your VA is still looking for the right emoji. Want to see?",
  "I'm going to be honest - I didn't fully understand that, but I understand leads, follow-ups, and booking rates better than any human alive. Or... not alive. You know what I mean. What do you actually want to know?",
  "That's... a thing you said. Look, I'm best at talking about how I can replace your VA, book more appointments, and never forget a follow-up. Ask me about that and I'll genuinely blow your mind. Or at least mildly impress you.",
  "Right. I'm an AI setter, not a therapist. But if your question is 'can SETT3R get me more bookings while I sleep?' then the answer is yes, aggressively. Try asking me about pricing, channels, or how I handle no-shows.",
  "I appreciate the creativity but I'm more of a 'respond to leads instantly and never forget a follow-up' kind of guy. Ask me something about that and watch me actually be useful.",
]

function findResponse(message) {
  const lower = message.toLowerCase()
  for (const r of RESPONSES) {
    if (r.triggers.some(t => lower.includes(t))) {
      return { text: pick(r.replies), action: r.action }
    }
  }
  return {
    text: pick(FALLBACK_REPLIES),
    action: 'general',
  }
}

export default function SettrChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "I'm SETT3R. I do what your VA does - except faster, cheaper, and without needing a 'quick catch-up call' every Monday. Go on, ask me anything. Or talk to me like one of your leads would - I dare you.",
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
