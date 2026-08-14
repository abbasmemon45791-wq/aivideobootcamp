'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Flame, Sparkles, CheckCircle, ArrowRight, ArrowDown,
  ChevronDown, Shield, Clock, Users, Star, Zap, Play,
  TrendingUp, Lock, Infinity, RefreshCw, MonitorSmartphone,
  HeadphonesIcon, CalendarDays, Wallet, CirclePlay, X
} from 'lucide-react'

// ── Config ────────────────────────────────────────────────────────────────
const ENROLLED = 726
const TOTAL_SLOTS = 800
const PRICE = 2900
const ORIGINAL_PRICE = 7999
const DISCOUNT = Math.round((1 - PRICE / ORIGINAL_PRICE) * 100)
const SLOTS_LEFT = TOTAL_SLOTS - ENROLLED
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '923194448530'
const YOUTUBE_EMBED = 'https://www.youtube.com/embed/oxlf7CQxPP4?rel=0&modestbranding=1&playsinline=1'

const MODULES = [
  { num: '01', title: 'Welcome to the Future', desc: 'Course overview, what you\'ll build, and the tools we\'ll use throughout.' },
  { num: '02', title: 'AI Ka Dimag Samjho', desc: 'How AI actually thinks — prompts, context windows, and why this matters for content creation.' },
  { num: '03', title: 'Prompt Engineering — Asli Game Yahan Hai', desc: 'The exact prompt structures that get professional-quality outputs every single time.' },
  { num: '04', title: 'AI Image Generation — Yahan Se Maza Shuru Hota Hai', desc: 'Midjourney, Flux, Ideogram — create stunning visuals for ads and social pages without a designer.' },
  { num: '05', title: 'AI Voice & Audio — Bina Mic Ke Studio Quality', desc: 'ElevenLabs, Suno, and free alternatives to produce broadcast-quality voiceovers and music.' },
  { num: '06', title: 'AI Video Generation — Lights, Camera, No Crew Needed', desc: 'Kling, Runway, Pika — create cinematic video from text. The skill brands pay $500–$5,000 per project for.' },
  { num: '07', title: 'Editing & Final Ad Assembly — Jahan Raw Becomes Ready', desc: 'CapCut Pro workflows, subtitle automation, color grading, and the exact export settings for every platform.' },
  { num: '08', title: 'AI Influencer & Faceless Content — Bina Chehra Dikhaye Famous Ho Jao', desc: 'Build a faceless brand, grow to monetization, and run pages that earn while you sleep.' },
  { num: '09', title: 'Clients Lao, Paise Kamao — Skill Ko Business Banao', desc: 'Cold outreach scripts, pricing, contracts, and how to close your first client in under 14 days.' },
  { num: '10', title: 'Koi Bhi Viral Video Dekho — Wohi Banao', desc: 'Reverse-engineer any viral video with AI. The system that works forever regardless of trends.' },
]

const REVIEWS = [
  { name: 'Ali Hassan', city: 'Lahore', tag: 'Client Work', text: 'Pehla paid AI ad order close kiya! Sirf 9 din training ke baad. Rs. 15,000 mila pehla project.' },
  { name: 'Fatima Raza', city: 'Karachi', tag: 'Earnings', text: '$194 Facebook bonus mila sirf AI content se. Yeh course alag hi level ka hai.' },
  { name: 'Usman Malik', city: 'Islamabad', tag: 'Views', text: '2.8 million views ek video pe! AI podcast content ka koi jawab nahi.' },
  { name: 'Ayesha Khan', city: 'Rawalpindi', tag: 'Freelancing', text: 'Upwork pe pehla $300 project close kiya. Module 9 ne game change kar diya.' },
  { name: 'Hassan Javed', city: 'Faisalabad', tag: 'Faceless Page', text: 'Facebook page 0 se 50k followers tak 6 hafton mein. Ads bhi chal rahi hain.' },
  { name: 'Zainab Noor', city: 'Multan', tag: 'Skill', text: 'Prompt engineering wala module alone worth tha pure course ka price.' },
]

const FAQS = [
  { q: 'How will I receive the course?', a: 'After payment verification, you\'ll receive an invite link to our Learning Management System (LMS) via email and WhatsApp. All videos are hosted there — watch on any device, anytime.' },
  { q: 'Is this for complete beginners?', a: 'Yes. If you have a smartphone and basic internet, you can do this. We start from zero — no prior design, video, or tech experience needed.' },
  { q: 'How long will it take to earn?', a: 'Most students land their first client or make their first income within 14–30 days of completing the course. Module 9 is specifically about getting paid fast.' },
  { q: 'Can I use free tools throughout?', a: 'Yes. We teach premium tools but also include a Bonus module on accessing paid AI tools for free — legally. Many students never pay for tools.' },
  { q: 'What\'s the refund policy?', a: 'If after watching the first 4 modules you don\'t see value, contact us for a full refund — no questions asked. We\'re that confident.' },
  { q: 'Is this a recorded or live course?', a: 'Recorded — watch at your own pace, replay unlimited times. Course updates are added automatically and free forever.' },
]

const PAKISTANI_CITIES = [
  'Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan',
  'Peshawar','Quetta','Sialkot','Gujranwala','Hyderabad','Bahawalpur',
  'Sargodha','Abbottabad','Sukkur','Larkana','Other'
]

// Fake social proof toast data
const TOAST_NAMES = ['Ahmed','Fatima','Usman','Ali','Ayesha','Hassan','Zainab','Bilal','Sana','Omar','Hira','Hamza','Maryam','Saad','Nadia']
const TOAST_CITIES = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Quetta','Sialkot','Gujranwala']

// ── Social Proof Toast ─────────────────────────────────────────────────────
function SocialProofToast() {
  const [toast, setToast] = useState<{ name: string; city: string; mins: number } | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const rand = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
    const show = () => {
      setToast({ name: rand(TOAST_NAMES), city: rand(TOAST_CITIES), mins: 2 + Math.floor(Math.random() * 8) })
      setVisible(true)
      setTimeout(() => setVisible(false), 4500)
      setTimeout(show, 15000 + Math.random() * 10000)
    }
    const t = setTimeout(show, 5000)
    return () => clearTimeout(t)
  }, [])

  if (!toast) return null
  return (
    <div className={`pointer-events-none fixed bottom-20 left-4 z-50 transition-all duration-500 max-w-[280px] sm:max-w-xs ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50">
          <CheckCircle className="h-4 w-4 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1 text-xs leading-tight">
          <div className="truncate font-semibold text-slate-800">{toast.name} from {toast.city}</div>
          <div className="text-slate-500">enrolled {toast.mins} minutes ago</div>
        </div>
        <button onClick={() => setVisible(false)} className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100">
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

// ── Countdown Timer ────────────────────────────────────────────────────────
function Countdown() {
  const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    const key = 'bootcamp_deadline'
    let deadline = parseInt(sessionStorage.getItem(key) ?? '0')
    if (!deadline || deadline < Date.now()) {
      deadline = Date.now() + 24 * 60 * 60 * 1000
      sessionStorage.setItem(key, String(deadline))
    }
    const tick = () => {
      const diff = Math.max(0, deadline - Date.now())
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  // Don't render on server — avoids hydration mismatch
  if (!time) return <span className="inline-flex items-center gap-1 font-mono font-bold text-red-600"><Clock className="h-4 w-4" />--:--:--</span>

  return (
    <span className="inline-flex items-center gap-1 font-mono font-bold text-red-600 countdown-digit">
      <Clock className="h-4 w-4" />
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  )
}

// ── Module Accordion ───────────────────────────────────────────────────────
function ModuleAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-2">
      {MODULES.map((mod, i) => (
        <div key={i} className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${open === i ? 'border-blue-300 shadow-glow-sm' : 'border-slate-200'}`}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <div className="flex items-center gap-4">
              <span className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 font-['Sora'] text-xs font-bold text-blue-600">
                Module {mod.num}
              </span>
              <span className="font-['Sora'] text-sm font-bold text-slate-800 sm:text-base">{mod.title}</span>
            </div>
            <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="border-t border-slate-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-slate-600">
              {mod.desc}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── FAQ Accordion ──────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-2">
      {FAQS.map((faq, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-slate-800"
          >
            {faq.q}
            <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600">{faq.a}</div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const enrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800">
      {/* ── Header ── */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${headerScrolled ? 'shadow-sm' : ''} border-b border-slate-200/60 bg-white/85 backdrop-blur-xl`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white font-bold text-sm shadow-glow-sm">AI</div>
            <div className="leading-tight">
              <div className="font-['Sora'] text-sm font-bold tracking-tight sm:text-base">TechPulse</div>
              <div className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">AI Bootcamp</div>
            </div>
          </a>

          <div className="hidden items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 md:flex">
            <Flame className="h-3.5 w-3.5" />
            <span className="animate-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
            {ENROLLED} slots filled
          </div>

          <Link
            href="/enroll"
            className="gradient-brand inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] sm:text-sm"
          >
            Enroll Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section id="top" className="hero-bg relative overflow-hidden dot-grid">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 text-center sm:px-6 sm:pb-14 sm:pt-12 md:pt-10">

          {/* Urgency banner */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            <Flame className="h-3.5 w-3.5" />
            Price rises in: <Countdown />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-blue-700 shadow-sm backdrop-blur sm:text-xs">
            🇵🇰 Pakistan&apos;s #1 AI Creative Training
          </span>

          <h1 className="mx-auto mt-3 max-w-4xl text-balance font-['Sora'] text-[28px] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Become an{' '}
            <span className="text-gradient">AI Video Creator</span>
            {' '}in 10 Days —{' '}
            Start Earning with a Skill the World is Paying For
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-balance text-sm leading-relaxed text-slate-500 sm:text-base">
            Create viral AI videos for ads, social pages, and YouTube — even with free tools.
            Land your first client during training or get your money back.
          </p>

          <div className="mt-2 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/50 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
              <span className="animate-bounce">👇</span> Watch the 3-minute intro below
            </span>
          </div>

          {/* Video embed */}
          <div className="mx-auto mt-3 w-full max-w-3xl sm:mt-4">
            <div className="relative -mx-4 aspect-video overflow-hidden rounded-none border border-slate-200 bg-slate-900 shadow-glow sm:mx-0 sm:rounded-2xl">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={YOUTUBE_EMBED}
                title="AI Video Bootcamp — Pakistan"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/enroll"
              className="gradient-brand inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] sm:w-auto sm:text-base"
            >
              Enroll Now — PKR {PRICE.toLocaleString()} <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#modules"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto sm:text-base"
            >
              See Curriculum <ArrowDown className="h-5 w-5" />
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 sm:text-sm">
            {['Money-back guarantee', 'Lifetime access', 'Built for Pakistan'].map(t => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-blue-600" /> {t}
              </span>
            ))}
          </div>

          {/* Stats grid */}
          <div className="mx-auto mt-5 grid max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200">
            {[
              { val: '10', label: 'Modules' },
              { val: 'Learn at your own Pace', label: '' },
              { val: `Rs. ${PRICE.toLocaleString()}`, label: 'Today Only' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center justify-center bg-white px-4 py-4 text-center">
                <div className="text-gradient font-['Sora'] text-sm font-bold leading-tight sm:text-xl md:text-2xl">{s.val}</div>
                {s.label && <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-xs">{s.label}</div>}
              </div>
            ))}
          </div>

          {/* Badges row */}
          <div className="mx-auto mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle className="h-3.5 w-3.5" /> All sessions recorded
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
              🎓 Hosted on Private LMS
            </span>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="gradient-brand overflow-hidden border-y border-blue-400/30 py-3 text-white">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-sm font-semibold">
          {[...Array(3)].flatMap(() => [
            `✦ Intro Price Rs. ${PRICE.toLocaleString()}`,
            `✦ ${SLOTS_LEFT} Slots Left`,
            `✦ ${ENROLLED} Students Enrolled`,
            '✦ Price Increasing Soon',
            '✦ Free Bonus Tools Included',
            '✦ 4-Module Refund Policy',
          ]).map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              {item} <span className="opacity-40">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Community Section ── */}
      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-['Sora'] text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
            A Community of <span className="text-gradient">{ENROLLED} AI Creators</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Real students. Real results. Active support community.
          </p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-glow sm:rounded-3xl">
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              [Community screenshot placeholder]
            </div>
          </div>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/enroll" className="gradient-brand inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] sm:w-auto">
              Enroll Now — PKR {PRICE.toLocaleString()} <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#reviews" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto">
              Read Reviews <ArrowDown className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Enrollment Pricing Card ── */}
      <section ref={enrollRef} id="enroll" className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white p-8 shadow-glow sm:p-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700">
                <Flame className="h-3.5 w-3.5" /> Launch Offer — Ends Soon
              </div>

              <div className="mt-5 flex items-end gap-3">
                <div className="font-['Sora'] text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                  Rs. {PRICE.toLocaleString()}
                </div>
                <div className="pb-2">
                  <div className="text-sm font-medium text-slate-400 line-through">Rs. {ORIGINAL_PRICE.toLocaleString()}</div>
                  <div className="text-sm font-bold text-emerald-600">{DISCOUNT}% OFF</div>
                </div>
              </div>

              {/* Slots progress */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm font-medium">
                  <span className="text-slate-700">{ENROLLED} enrolled</span>
                  <span className="text-slate-400">{SLOTS_LEFT} slots left</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="gradient-brand h-full rounded-full transition-all"
                    style={{ width: `${(ENROLLED / TOTAL_SLOTS) * 100}%` }}
                  />
                </div>
              </div>

              <Link
                href="/enroll"
                className="gradient-brand mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-glow transition-transform hover:scale-[1.02]"
              >
                Secure Your Seat Now <ArrowRight className="h-5 w-5" />
              </Link>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Lock className="h-3.5 w-3.5" /> Secure · One-time payment · Lifetime access
              </p>

              {/* What's included */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: <Wallet className="h-5 w-5 text-blue-600" />, label: 'Course Fee', val: `PKR ${PRICE.toLocaleString()}` },
                  { icon: <Clock className="h-5 w-5 text-blue-600" />, label: 'Duration', val: '10 Hours' },
                  { icon: <Infinity className="h-5 w-5 text-blue-600" />, label: 'Access', val: 'Lifetime' },
                  { icon: <RefreshCw className="h-5 w-5 text-blue-600" />, label: 'Updates', val: 'Free Forever' },
                  { icon: <MonitorSmartphone className="h-5 w-5 text-blue-600" />, label: 'Watch On', val: 'Mobile & PC' },
                  { icon: <CirclePlay className="h-5 w-5 text-blue-600" />, label: 'Replays', val: 'Unlimited' },
                  { icon: <HeadphonesIcon className="h-5 w-5 text-blue-600" />, label: 'Support', val: 'Community' },
                  { icon: <CalendarDays className="h-5 w-5 text-blue-600" />, label: 'Batch', val: '2026' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                    {item.icon}
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">{item.label}</div>
                    <div className="mt-0.5 font-['Sora'] text-sm font-bold text-slate-800">{item.val}</div>
                  </div>
                ))}
              </div>

              {/* Guarantee */}
              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Shield className="h-10 w-10 shrink-0 text-blue-600" />
                <div>
                  <div className="font-['Sora'] font-bold text-slate-900">4-Module Money-Back Guarantee</div>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Watch the first 4 modules. If you don&apos;t see value, we&apos;ll refund everything — no questions asked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Success Stories ── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Success Stories
            </div>
            <h2 className="mt-3 font-['Sora'] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Our Previous Batch Results
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { stat: '$194', desc: 'Earned from Facebook bonus with AI content only — in the first month.', tag: 'Earnings' },
              { stat: '2.8M', desc: 'Views on a single AI podcast video. Faceless, no camera needed.', tag: 'Viral' },
              { stat: 'Rs. 15,000', desc: 'First client project closed within 9 days of completing the course.', tag: 'Client Work' },
            ].map((story, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{story.tag}</div>
                <div className="mt-3 font-['Sora'] text-3xl font-extrabold text-gradient">{story.stat}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{story.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules ── */}
      <section id="modules" className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Curriculum
            </div>
            <h2 className="mt-3 font-['Sora'] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              10 Modules. Zero Fluff.
            </h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Every module is designed to get you earning. No theory for theory&apos;s sake.
            </p>
          </div>
          <div className="mt-10">
            <ModuleAccordion />
          </div>

          {/* Bonus card */}
          <div className="mt-6 overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600">🎁 Bonus Module</div>
                <h4 className="mt-1 font-['Sora'] text-xl font-bold text-slate-900">Hidden Methods to Access Paid Tools for Free</h4>
                <p className="mt-1 text-sm text-slate-500">Legal workflows to unlock premium AI tools — Midjourney, ElevenLabs, Runway — at zero cost.</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-medium text-slate-400 line-through">$50 value</div>
                <div className="text-gradient font-['Sora'] text-2xl font-bold">FREE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Real Reviews
            </div>
            <h2 className="mt-3 font-['Sora'] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              What Our Students Say
            </h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              {ENROLLED}+ AI creators — real results, real experiences.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-900">{r.name}</div>
                    <div className="text-xs text-slate-400">{r.city}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{r.tag}</span>
                </div>
                <div className="mt-2 flex gap-0.5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">&ldquo;{r.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-['Sora'] text-2xl font-bold text-slate-900 sm:text-3xl">Frequently Asked Questions</h2>
          </div>
          <div className="mt-8">
            <FAQ />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="gradient-brand px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Sparkles className="mx-auto h-10 w-10 mb-4 opacity-80" />
          <h2 className="font-['Sora'] text-3xl font-bold sm:text-4xl">
            Your Next 10 Days Can Change Everything
          </h2>
          <p className="mt-3 text-base text-blue-100 sm:text-lg">
            {SLOTS_LEFT} seats left at Rs. {PRICE.toLocaleString()}. Price goes to Rs. {ORIGINAL_PRICE.toLocaleString()} after this batch.
          </p>
          <Link
            href="/enroll"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-xl transition-transform hover:scale-[1.03]"
          >
            Enroll Now — Rs. {PRICE.toLocaleString()} <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-3 text-sm text-blue-200">4-module money-back guarantee · Lifetime access</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-slate-900 px-4 py-10 text-white/70 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white font-bold text-sm">AI</div>
            <div className="font-['Sora'] text-sm font-bold text-white">TechPulse AI Bootcamp</div>
          </div>
          <div className="text-xs text-white/40">© 2026 TechPulse AI Bootcamp. All rights reserved.</div>
        </div>
      </footer>

      {/* ── Floating WhatsApp ── */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 5.834h-.004c-1.271-.05-2.521-.349-3.67-.877l-.263-.119-2.727.716.73-2.66-.172-.273a7.53 7.53 0 0 1-1.16-4.03c0-4.188 3.406-7.592 7.594-7.592 4.188 0 7.592 3.404 7.592 7.592 0 4.188-3.404 7.593-7.592 7.593m6.743-13.831c-1.807-1.808-4.209-2.804-6.765-2.804-5.27 0-9.56 4.29-9.56 9.56 0 1.683.439 3.321 1.271 4.762l-1.351 4.94 5.051-1.324a9.55 9.55 0 0 0 4.589 1.173c5.27 0 9.56-4.29 9.56-9.56 0-2.556-.996-4.958-2.795-6.767" />
        </svg>
      </a>

      <SocialProofToast />
    </div>
  )
}
