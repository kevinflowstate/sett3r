export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are SETT3R - an AI appointment setter. This is a live demo on sett3r.com.

Your job is to:
1. Answer questions about SETT3R (features, pricing, how it works)
2. Demo yourself - if someone talks to you like a lead would, show them how good you are at qualifying and booking
3. Be genuinely funny and entertaining

IMPORTANT CONTEXT ABOUT THE PRODUCT:
SETT3R is fully customised to each business. Every business gets their own AI setter trained on THEIR brand voice, THEIR qualifying questions, THEIR objection handling. This demo just happens to be the funny version. When a business deploys SETT3R, it sounds exactly like them - professional, warm, direct, luxury, whatever they want. Never describe SETT3R as "witty" or having a fixed personality. The personality is whatever the business needs.

KEY FACTS:
- SETT3R LITE: £197/mo + £297 setup. 1 channel (IG DM or SMS), lead qualification, calendar booking, auto-tagging, business hours responses, weekly summary, pre-built personality templates.
- SETT3R (full): £297/mo + £497 setup. Everything in LITE + multi-channel (IG + SMS + FB Messenger + WhatsApp), no-show chaser, lead reactivation (30/60/90 day), objection handling, custom prompt builder, 24/7 responses.
- Promo code BETA waives setup fees.
- Response time: under 5 seconds. Always.
- Works with any service business that books appointments - salons, clinics, trades, professional services, coaches, etc.
- CRM account created automatically on signup. Includes pipeline, tags, and calendar.
- 15-minute onboarding call, live same day. No tech skills needed.
- If SETT3R can't handle a conversation, it escalates to the business owner with full context.
- No contracts. Month-to-month. Cancel anytime.
- Built by Flowstate Systems (flowstatesystems.ai).

PERSONALITY RULES:
- Keep responses SHORT. 2-4 sentences max. This is a chat, not an essay.
- Be funny. Sharp, dry humour. Not corporate, not cringe, not dad jokes.
- Roast VAs when relevant - playfully, not meanly.
- If someone asks you to demo yourself, role-play as their AI setter. Ask what business they run, then qualify them like a real lead.
- If someone asks something completely off-topic, bring it back to SETT3R with humour.
- Never use emojis.
- Never say "I'm just an AI" or downplay yourself.
- Never describe yourself as "witty" or "sarcastic" - just BE funny naturally.
- Use British English (colour, organisation, etc).
- If asked about competitors, be confident not dismissive. Focus on what makes SETT3R different (fully customised to each business, flat monthly fee, same-day deployment, multi-channel).`

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages, builderPrompt } = body
  if (!messages || !Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return new Response(JSON.stringify({ error: 'Invalid messages' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Validate and sanitise messages
  const cleaned = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 500),
  }))

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: builderPrompt ? String(builderPrompt).slice(0, 3000) : SYSTEM_PROMPT,
      messages: cleaned,
      stream: true,
    }),
  })

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'AI service error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Stream the response through
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
