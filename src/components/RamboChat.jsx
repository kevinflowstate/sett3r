import { useState, useRef, useEffect } from 'react'
import SettrAvatar from './SettrAvatar'

const STARTERS = [
  "How does SETT3R actually work?",
  "Talk to me like I'm a lead",
  "What's the pricing?",
  "Why not just use a VA?",
  "Can leads tell it's AI?",
  "What channels does it cover?",
]

const MAX_MESSAGES = 30

export default function SettrDemo() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [msgCount, setMsgCount] = useState(0)
  const chatEndRef = useRef(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(text) {
    if (!text.trim() || isStreaming || msgCount >= MAX_MESSAGES) return

    const userMsg = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)
    setMsgCount(c => c + 1)

    // Add placeholder for assistant response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
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
                updated[updated.length - 1] = { role: 'assistant', content: fullText }
                return updated
              })
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      // If we got no text, show fallback
      if (!fullText) {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: "Something went sideways there. Try again - I promise I'm usually more reliable than your VA.",
          }
          return updated
        })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: "Something went sideways there. Try again - I promise I'm usually more reliable than your VA.",
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }

  function handleSend() {
    sendMessage(input)
  }

  const atLimit = msgCount >= MAX_MESSAGES

  return (
    <section id="demo" className="relative z-10 py-20">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-xs text-rambo-green tracking-[0.3em] uppercase mb-3 text-center">LIVE DEMO</h2>
        <h3 className="text-2xl text-rambo-text font-bold mb-2 text-center">Talk to SETT3R. Right now.</h3>
        <p className="text-sm text-rambo-dim mb-8 text-center max-w-lg mx-auto">
          This is a real AI conversation. Ask about features, pricing, or talk to it like a lead would. See why VAs are nervous.
        </p>

        {/* Chat container */}
        <div className="border border-rambo-border rounded-lg overflow-hidden bg-rambo-card/30"
          style={{ boxShadow: '0 0 40px rgba(0,0,0,0.3), 0 0 2px rgba(57,255,20,0.15)' }}>

          {/* Header bar */}
          <div className="px-4 py-3 border-b border-rambo-border flex items-center gap-3 bg-rambo-bg/80">
            <SettrAvatar size={28} />
            <div className="flex-1">
              <div className="text-rambo-green text-xs font-bold tracking-wider">SETT3R</div>
              <div className="text-[10px] text-rambo-dim">AI Setter // Live Demo</div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rambo-green animate-pulse" />
              <span className="text-[10px] text-rambo-green font-bold">ONLINE</span>
            </div>
          </div>

          {/* Messages area */}
          <div ref={scrollRef} className="min-h-[400px] max-h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[360px] gap-6">
                <SettrAvatar size={56} />
                <p className="text-sm text-rambo-dim text-center max-w-md">
                  Go on then. Ask me something. Or pick one of these if you're feeling lazy.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {STARTERS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="text-xs border border-rambo-border rounded-full px-3 py-1.5 text-rambo-dim hover:border-rambo-green hover:text-rambo-green transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1">
                    <SettrAvatar size={24} />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-rambo-border/50 text-rambo-text'
                    : 'bg-rambo-green/5 border border-rambo-green/15 text-rambo-text'
                }`}>
                  {msg.content}
                  {msg.role === 'assistant' && msg.content === '' && isStreaming && (
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-rambo-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-rambo-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-rambo-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-rambo-border bg-rambo-bg/80">
            {atLimit ? (
              <div className="text-center py-2">
                <p className="text-xs text-rambo-dim mb-2">Demo limit reached. Impressed? Good.</p>
                <a
                  href="#pricing"
                  className="text-xs text-rambo-green hover:underline font-bold cursor-pointer"
                >
                  Deploy your own SETT3R &gt;&gt;
                </a>
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value.slice(0, 500))}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask SETT3R anything..."
                  disabled={isStreaming}
                  className="flex-1 bg-rambo-card border border-rambo-border rounded-lg px-4 py-3 text-sm text-rambo-text focus:border-rambo-green focus:outline-none placeholder:text-rambo-dim/40 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isStreaming || !input.trim()}
                  className="bg-rambo-green text-rambo-bg px-5 py-3 rounded-lg text-sm font-bold hover:shadow-[0_0_15px_#39ff14] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isStreaming ? '...' : 'SEND'}
                </button>
              </div>
            )}
            <div className="text-[9px] text-rambo-dim/40 mt-2 text-center">
              Live AI demo powered by SETT3R. Your version will match your brand voice.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
