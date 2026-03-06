import { useNavigate } from 'react-router-dom'
import SettrAvatar from '../components/SettrAvatar'
import SettrChat from '../components/RamboChat'

// Stripe Payment Links - monthly subscription + one-time setup fee, promo codes enabled
// After payment, redirects to /setup
const STRIPE_LITE_URL = 'https://buy.stripe.com/aFa7sM4Mn55Ke0Fdlebwk0s'
const STRIPE_FULL_URL = 'https://buy.stripe.com/cNicN6a6H8hWbSxbd6bwk0t'

const TIERS = [
  {
    name: 'SETT3R LITE',
    price: '197',
    setup: '297',
    tag: 'STARTER',
    color: 'rambo-green',
    checkoutUrl: STRIPE_LITE_URL,
    features: [
      '1 channel (IG DM or SMS)',
      'Lead qualification (3 Qs)',
      'Calendar booking',
      'Auto-tagging + pipeline updates',
      'Business hours responses',
      'Weekly summary email',
      'Pre-built personality templates',
    ],
    cta: 'DEPLOY LITE',
  },
  {
    name: 'SETT3R',
    price: '297',
    setup: '497',
    tag: 'MOST POPULAR',
    color: 'rambo-purple',
    popular: true,
    checkoutUrl: STRIPE_FULL_URL,
    features: [
      'Everything in LITE',
      'Multi-channel (IG + SMS + FB Messenger + WhatsApp)',
      'No-show chaser (auto rebooking)',
      'Lead reactivation (30/60/90 day)',
      'Objection handling library',
      'Custom prompt builder',
      '24/7 responses',
      'Weekly summary email',
    ],
    cta: 'DEPLOY SETT3R',
  },
]

const VA_COMPARISON = [
  { label: 'Response time', va: '5-30 minutes', settr: 'Under 5 seconds' },
  { label: 'Availability', va: '8 hours/day, weekdays', settr: '24/7/365' },
  { label: 'Conversations/day', va: '20-30 max', settr: 'Unlimited' },
  { label: 'Follows up consistently', va: 'Sometimes', settr: 'Every single time' },
  { label: 'Handles objections', va: 'Reads a script', settr: 'Adapts in real-time' },
  { label: 'Multi-channel', va: 'One at a time', settr: 'All channels, one brain' },
  { label: 'Takes holidays', va: 'Yes', settr: 'Never' },
  { label: 'Needs managing', va: 'Constantly', settr: 'Set and forget' },
  { label: 'Monthly cost', va: '\u00A31,200 - \u00A32,000', settr: 'From \u00A3297' },
]

const STATS = [
  { value: '<5s', label: 'Average response time' },
  { value: '24/7', label: 'Always online' },
  { value: '3x', label: 'More appointments booked' },
  { value: '40%', label: 'No-shows recovered' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="scanline min-h-screen">
      {/* Grid bg */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#39ff14 1px, transparent 1px), linear-gradient(90deg, #39ff14 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Nav */}
      <nav className="relative z-10 border-b border-rambo-border bg-rambo-bg/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SettrAvatar size={28} />
            <span className="text-rambo-green font-bold text-sm tracking-wider">SETT3R</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <a href="#features" className="text-rambo-dim hover:text-rambo-green transition-colors">FEATURES</a>
            <a href="#comparison" className="text-rambo-dim hover:text-rambo-green transition-colors">VS VA</a>
            <a href="#pricing" className="text-rambo-dim hover:text-rambo-green transition-colors">PRICING</a>
            <button
              onClick={() => navigate('/builder')}
              className="bg-rambo-green text-rambo-bg px-4 py-1.5 rounded text-xs font-bold hover:shadow-[0_0_15px_#39ff14] transition-all cursor-pointer"
            >
              TRY BUILDER
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center">
          <div className="flex items-center justify-center gap-5 mb-6">
            <SettrAvatar size={90} />
            <div className="text-left">
              <h1 className="text-6xl font-bold text-rambo-green glow-text tracking-tight leading-none">
                SETT3R
              </h1>
              <p className="text-rambo-purple text-sm tracking-[0.2em] uppercase mt-1 font-bold">
                AI Appointment Setter
              </p>
            </div>
          </div>

          <p className="text-2xl text-rambo-text max-w-2xl mx-auto leading-relaxed mb-2">
            Responds before your VA opens the laptop.
          </p>
          <p className="text-sm text-rambo-dim mb-8">
            The AI setter that qualifies, handles objections, and books - while your VA is still looking for the charger.
          </p>

          <div className="border border-rambo-border bg-rambo-card/60 p-5 rounded-lg mb-10 max-w-xl mx-auto text-left text-sm">
            <p className="text-rambo-text leading-loose">
              <span className="text-rambo-green">$&gt;</span> Lead DMs at 2am. SETT3R replies in 3 seconds.<br />
              <span className="text-rambo-green">$&gt;</span> Qualifies them. Handles "how much is it?"<br />
              <span className="text-rambo-green">$&gt;</span> Books them straight into your calendar.<br />
              <span className="text-rambo-green">$&gt;</span> You wake up. Calendar's full. VA's still asleep.<span className="cursor-blink" />
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="#pricing"
              className="bg-rambo-green text-rambo-bg font-bold px-8 py-3 rounded border-2 border-rambo-green hover:bg-transparent hover:text-rambo-green transition-all duration-200 cursor-pointer text-sm tracking-wider inline-block"
            >
              SEE PRICING &gt;&gt;
            </a>
            <button
              onClick={() => navigate('/builder')}
              className="border-2 border-rambo-border text-rambo-dim px-8 py-3 rounded hover:border-rambo-green hover:text-rambo-green transition-all duration-200 cursor-pointer text-sm tracking-wider"
            >
              TRY THE BUILDER
            </button>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative z-10 border-y border-rambo-border bg-rambo-card/40">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-rambo-green mb-1">{s.value}</div>
              <div className="text-xs text-rambo-dim tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-xs text-rambo-red tracking-[0.3em] uppercase mb-3">THE PROBLEM</h2>
        <h3 className="text-2xl text-rambo-text font-bold mb-8">Your VA is costing you leads. And they don't even know it.</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Takes 30 minutes to respond. The lead already messaged your competitor.',
            'Works 9-5. Your leads come in at 10pm on a Saturday.',
            'Reads from a script. Can\'t handle "how much?" without freezing up.',
            'Forgets follow-ups. Dead leads pile up in your CRM like digital dust.',
            'Takes holidays. Gets sick. Quits with no notice. Classic.',
            'Costs you \u00A31,500/mo and still needs you to check their work.',
          ].map((p, i) => (
            <div key={i} className="flex gap-3 items-start border border-rambo-border bg-rambo-card/40 rounded p-4">
              <span className="text-rambo-red text-sm mt-0.5">x</span>
              <p className="text-sm text-rambo-dim leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 border-y border-rambo-border bg-rambo-card/20 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-xs text-rambo-green tracking-[0.3em] uppercase mb-3">WHAT SETT3R DOES</h2>
          <h3 className="text-2xl text-rambo-text font-bold mb-10">Everything your VA should be doing. Faster. Cheaper. 24/7.</h3>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'INSTANT RESPONSE',
                desc: 'Every lead gets a reply in under 5 seconds. DMs, SMS, Facebook Messenger, WhatsApp - all channels, one brain. Your VA is still finding the WiFi password.',
                icon: '>_',
              },
              {
                title: 'SMART QUALIFICATION',
                desc: '3 qualifying questions, personalised to your business. Spots price shoppers, time-wasters, and hot prospects. No clipboard required.',
                icon: '?=',
              },
              {
                title: 'CALENDAR BOOKING',
                desc: 'Checks your availability, offers slots, confirms the booking. Syncs with GHL, Calendly, Acuity - whatever you\'re running.',
                icon: '[+]',
              },
              {
                title: 'NO-SHOW CHASER',
                desc: 'Missed appointment? SETT3R follows up within 10 minutes. Recovers 30-40% of no-shows. Your VA just marks them as "lost" and moves on.',
                icon: '!!',
              },
              {
                title: 'OBJECTION HANDLING',
                desc: '"How much?", "I\'ll think about it", "is it worth it?" - SETT3R handles them all with your brand voice. No deer-in-headlights moment.',
                icon: '<>',
              },
              {
                title: 'LEAD REACTIVATION',
                desc: 'Dead leads get re-engaged at 30, 60, and 90 days. That database your VA ignores? It\'s a goldmine SETT3R actually mines.',
                icon: '()',
              },
              {
                title: 'YOUR VOICE',
                desc: 'Direct, warm, funny, premium - SETT3R matches your brand personality. Leads can\'t tell the difference. Your VA can\'t spell your brand name.',
                icon: '""',
              },
              {
                title: 'CRM AUTOPILOT',
                desc: 'Auto-tags contacts, moves pipeline stages, deduplicates entries. Your CRM stays clean. No more "I forgot to update it."',
                icon: '{}',
              },
              {
                title: 'WEEKLY SUMMARY',
                desc: '"23 leads, 9 booked, 4 no-shows chased, 2 reactivated." Straight to your inbox every Monday. Your VA would need a spreadsheet, a coffee, and a reminder.',
                icon: '#_',
              },
            ].map((f, i) => (
              <div key={i} className="border border-rambo-border bg-rambo-card/60 rounded-lg p-5 hover:border-rambo-green/30 transition-colors">
                <div className="text-rambo-green text-lg font-bold mb-2">{f.icon}</div>
                <h4 className="text-sm text-rambo-text font-bold mb-2 tracking-wider">{f.title}</h4>
                <p className="text-xs text-rambo-dim leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section id="comparison" className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-xs text-rambo-green tracking-[0.3em] uppercase mb-3">HEAD TO HEAD</h2>
        <h3 className="text-2xl text-rambo-text font-bold mb-10">SETT3R vs. Your Virtual Assistant</h3>

        <div className="border border-rambo-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 bg-rambo-card border-b border-rambo-border">
            <div className="p-3 text-xs text-rambo-dim"></div>
            <div className="p-3 text-xs text-rambo-dim text-center tracking-wider border-l border-rambo-border">YOUR VA</div>
            <div className="p-3 text-xs text-rambo-green text-center tracking-wider border-l border-rambo-border font-bold">SETT3R</div>
          </div>
          {VA_COMPARISON.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 ${i < VA_COMPARISON.length - 1 ? 'border-b border-rambo-border' : ''} ${i % 2 === 0 ? 'bg-rambo-card/30' : ''}`}>
              <div className="p-3 text-xs text-rambo-text">{row.label}</div>
              <div className="p-3 text-xs text-rambo-red/80 text-center border-l border-rambo-border">{row.va}</div>
              <div className="p-3 text-xs text-rambo-green text-center border-l border-rambo-border font-bold">{row.settr}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 border-y border-rambo-border bg-rambo-card/20 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-xs text-rambo-green tracking-[0.3em] uppercase mb-3">DEPLOYMENT</h2>
          <h3 className="text-2xl text-rambo-text font-bold mb-10">Live in 24 hours. Your VA took 2 weeks to learn your name.</h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'CONFIGURE',
                desc: 'Tell SETT3R your business name, target audience, and personality. Set your qualifying questions. Takes 5 minutes in the builder.',
              },
              {
                step: '02',
                title: 'CONNECT',
                desc: '15-minute onboarding call. We connect your Instagram, Facebook, SMS, and calendar. Your account is already set up before you even join.',
              },
              {
                step: '03',
                title: 'DEPLOY',
                desc: 'SETT3R goes live immediately. Every inbound lead gets handled. You get daily reports and a full calendar. Your VA gets a LinkedIn update.',
              },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="text-4xl font-bold text-rambo-green/20 mb-2">{s.step}</div>
                <h4 className="text-sm text-rambo-green font-bold mb-2 tracking-wider">{s.title}</h4>
                <p className="text-xs text-rambo-dim leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-xs text-rambo-green tracking-[0.3em] uppercase mb-3 text-center">PRICING</h2>
        <h3 className="text-2xl text-rambo-text font-bold mb-3 text-center">Pick your tier. Fire your VA.</h3>
        <p className="text-sm text-rambo-dim mb-12 text-center">All plans include CRM account, onboarding call, and same-day deployment. No contracts.</p>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {TIERS.map((tier, i) => (
            <div
              key={i}
              className={`relative border rounded-lg p-6 flex flex-col ${
                tier.popular
                  ? 'border-rambo-purple bg-rambo-purple/5 shadow-[0_0_30px_rgba(168,85,247,0.1)]'
                  : 'border-rambo-border bg-rambo-card/40'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rambo-purple text-rambo-bg text-[10px] font-bold px-3 py-0.5 rounded-full tracking-widest">
                  {tier.tag}
                </div>
              )}
              {!tier.popular && (
                <div className="text-[10px] text-rambo-dim tracking-widest mb-2">{tier.tag}</div>
              )}

              <h4 className={`text-lg font-bold mb-1 tracking-wider text-${tier.color}`}>{tier.name}</h4>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-rambo-text">{'\u00A3'}{tier.price}</span>
                <span className="text-xs text-rambo-dim">/mo</span>
              </div>
              <div className="text-[10px] text-rambo-dim mb-5">+ {'\u00A3'}{tier.setup} setup</div>

              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex gap-2 text-xs">
                    <span className={`text-${tier.color} mt-0.5`}>+</span>
                    <span className="text-rambo-dim">{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.checkoutUrl}
                className={`w-full py-2.5 rounded text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer text-center block ${
                  tier.popular
                    ? 'bg-rambo-purple text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                    : `border border-${tier.color}/50 text-${tier.color} hover:bg-${tier.color}/10`
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-rambo-dim mt-4">
          Have a promo code? Enter it at checkout.
        </p>

        <p className="text-center text-xs text-rambo-dim mt-8">
          Not sure which tier? Talk to SETT3R in the chat widget. No contracts - cancel anytime.
        </p>
      </section>

      {/* FAQ */}
      <section className="relative z-10 border-t border-rambo-border bg-rambo-card/20 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-xs text-rambo-green tracking-[0.3em] uppercase mb-3 text-center">FAQ</h2>
          <h3 className="text-2xl text-rambo-text font-bold mb-10 text-center">Common questions</h3>

          <div className="space-y-4">
            {[
              {
                q: 'Can leads tell it\'s AI?',
                a: 'No. SETT3R is trained to match your brand voice and conversation style. It handles context, objections, and follow-ups naturally. If a conversation ever needs a human, it escalates to you with full context. Think of it as the world\'s most reliable employee who never has a bad day.',
              },
              {
                q: 'What if I already have a CRM?',
                a: 'SETT3R runs on GoHighLevel, which becomes your all-in-one CRM, calendar, and communication hub. Your account is created automatically when you sign up - no tech setup needed.',
              },
              {
                q: 'How fast can I go live?',
                a: 'Same day. When you pay, your account is auto-created. The onboarding call is 15 minutes - we connect your socials and calendar. SETT3R starts handling leads immediately after. Your VA took longer to set up their email signature.',
              },
              {
                q: 'What happens if SETT3R can\'t handle a conversation?',
                a: 'It escalates to you instantly via Slack or SMS with the full conversation history. You step in with full context. Most businesses see less than 5% of conversations need human intervention.',
              },
              {
                q: 'Can I change the personality or questions later?',
                a: 'Anytime. The builder lets you reconfigure personality, qualifying questions, objection handling, and channel settings. Changes go live immediately. Try getting a VA to change their personality on demand.',
              },
              {
                q: 'Is there a contract?',
                a: 'No long-term contracts. Month-to-month. If SETT3R isn\'t booking you more appointments than your current setup, cancel anytime. We\'re confident you won\'t.',
              },
            ].map((faq, i) => (
              <div key={i} className="border border-rambo-border rounded-lg p-5 bg-rambo-card/40">
                <h4 className="text-sm text-rambo-text font-bold mb-2">{faq.q}</h4>
                <p className="text-xs text-rambo-dim leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <SettrAvatar size={64} />
          <h3 className="text-2xl text-rambo-green font-bold mt-6 mb-3 glow-text">Your leads don't wait. Why should you?</h3>
          <p className="text-sm text-rambo-dim mb-8 max-w-lg mx-auto">
            SETT3R is online right now. Your VA is... well, we're not sure where they are actually.
          </p>
          <a
            href="#pricing"
            className="bg-rambo-green text-rambo-bg font-bold px-10 py-4 rounded border-2 border-rambo-green hover:bg-transparent hover:text-rambo-green transition-all duration-200 cursor-pointer text-sm tracking-wider inline-block"
          >
            DEPLOY SETT3R &gt;&gt;
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-rambo-border py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-[10px] text-rambo-dim">
          <span>SETT3R // Built by Flowstate Systems</span>
          <span>STATUS: <span className="text-rambo-green">ONLINE</span> // RESPONSE TIME: 0.3ms // YOUR VA: <span className="text-rambo-red">OFFLINE</span></span>
        </div>
      </footer>

      {/* Chat Widget */}
      <SettrChat />
    </div>
  )
}
