'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Flame, Sparkles, CheckCircle, ArrowRight, ArrowDown,
  ChevronDown, Shield, Clock, Users, Star, Zap, Play,
  TrendingUp, Lock, Infinity, RefreshCw, MonitorSmartphone,
  HeadphonesIcon, CalendarDays, Wallet, CirclePlay, X,
  Briefcase, DollarSign, GraduationCap, Rocket, Mic
} from 'lucide-react'

// ── Config ────────────────────────────────────────────────────────────────
const ENROLLED = 1057
const PRICE = 1999
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '923194448530'
const SUPPORT_EMAIL = 'aivideoboootcamp@gmail.com'
const YOUTUBE_EMBED = 'https://www.youtube.com/embed/oxlf7CQxPP4?rel=0&modestbranding=1&playsinline=1'

const MODULES = [
  { num: '01', title: 'Welcome to the Future', desc: 'Course ka overview, aap kya seekhenge aur build karenge, aur pure course mein kaunse tools use honge.' },
  { num: '02', title: 'AI Ka Dimag Samjho', desc: 'AI kaise sochta aur kaam karta hai — prompts, context windows, aur content creation ke liye iski importance.' },
  { num: '03', title: 'Prompt Engineering — Asli Game Yahan Hai', desc: 'Woh exact prompt formulas aur structures jo aapko har baar professional-quality outputs dein.' },
  { num: '04', title: 'AI Image Generation — Yahan Se Maza Shuru Hota Hai', desc: 'Midjourney, Flux, Ideogram — bina designer ke ads aur social media ke liye stunning visuals banao.' },
  { num: '05', title: 'AI Voice & Audio — Bina Mic Ke Studio Quality', desc: 'ElevenLabs, Suno, aur free tools — bina mic aur studio ke professional voiceovers aur music generate karo.' },
  { num: '06', title: 'AI Video Generation — Lights, Camera, No Crew Needed', desc: 'Kling, Runway, Pika — text se high-quality cinematic videos banao. Aaj ki sab se high-demand creative skill.' },
  { num: '07', title: 'Editing & Final Ad Assembly — Jahan Raw Becomes Ready', desc: 'CapCut Pro workflows, auto-subtitles, color grading, aur har platform ke liye perfect export settings.' },
  { num: '08', title: 'Faceless AI Content Creation — Audience Building', desc: 'Bina chehra dikhaye apna brand banao, high-engagement reels aur videos publish karo, aur automated workflows se audience build karo.' },
  { num: '09', title: 'Finding Clients & Freelancing — Portfolio to Projects', desc: 'Cold outreach scripts, portfolio presentation, pricing strategies, proposals, aur freelance projects manage karne ki proven techniques.' },
  { num: '10', title: 'Koi Bhi Viral Video Dekho — Wohi Banao', desc: 'Kisi bhi viral video ko AI se reverse-engineer karo aur exact waise hi high-performing viral content banao.' },
]

const REVIEWS = [
  { name: 'Ali Hassan', city: 'Lahore', tag: 'Client Work', text: 'Pehla AI ad campaign successfully deliver kiya! Training ke foran baad. Course ne sab practical seekha diya.' },
  { name: 'Fatima Raza', city: 'Karachi', tag: 'Content Creator', text: 'AI product photography aur faceless reels banana itna aasan ho gaya. Training ne workflow ko 10x fast kar diya.' },
  { name: 'Usman Malik', city: 'Islamabad', tag: 'Views', text: '2.8 million views ek video pe! AI podcast content ka koi jawab nahi.' },
  { name: 'Ayesha Khan', city: 'Rawalpindi', tag: 'Freelancing', text: 'Upwork pe pehla AI design project complete kiya. Module 9 ne game change kar diya.' },
  { name: 'Hassan Javed', city: 'Faisalabad', tag: 'Faceless Page', text: 'Facebook page 0 se 50k followers tak 6 hafton mein. Organic growth ka kamaal.' },
  { name: 'Zainab Noor', city: 'Multan', tag: 'Skill', text: 'Prompt engineering wala module alone worth tha pure course ka price.' },
]

const FAQS = [
  { q: 'How will I receive the course?', a: 'After payment verification, you\'ll receive an invite link to our Learning Management System (LMS) via email and WhatsApp. All videos are hosted there — watch on any device, anytime.' },
  { q: 'Is this for complete beginners?', a: 'Yes. If you have a smartphone and basic internet, you can do this. We start from zero — no prior design, video, or tech experience needed.' },
  { q: 'How soon can I start using these skills?', a: 'Most students start building their portfolio and reaching out to potential clients right after completing the course. Module 9 is specifically about client acquisition strategies.' },
  { q: 'Can I use free tools throughout?', a: 'Yes. We teach premium tools but also include a Bonus module on accessing paid AI tools for free — legally. Many students never pay for tools.' },
  { q: 'What\'s the refund policy?', a: 'If after watching the first 4 modules you don\'t see value, contact us for a full refund — no questions asked. We\'re that confident.' },
  { q: 'Is this a recorded or live course?', a: 'Recorded — watch at your own pace, replay unlimited times. Course updates are added automatically and free forever.' },
]

const PAKISTANI_CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur',
  'Sargodha', 'Abbottabad', 'Sukkur', 'Larkana', 'Other'
]



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
        <div key={i} className={`overflow-hidden rounded-xl border transition-colors duration-300 ${open === i ? 'border-blue-200 bg-blue-50/40 shadow-sm' : 'border-slate-200 bg-white'}`}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold transition-colors duration-300 ${open === i ? 'text-blue-700' : 'text-slate-800'}`}
          >
            {faq.q}
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
          </button>
          {open === i && (
            <div className="border-t border-slate-200/50 px-4 py-3 text-sm leading-relaxed text-slate-600">{faq.a}</div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── WhatsApp Mockups ───────────────────────────────────────────────────────
function WhatsAppChat({ name, avatarInitial, messages }: { name: string, avatarInitial: string, messages: any[] }) {
  return (
    <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[2.5rem] border-8 border-slate-900 bg-[#0B141A] shadow-2xl">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-6 pt-3 text-[10px] font-medium text-white">
        <span>4:16</span>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-white/80" />
          <div className="h-2 w-3 rounded-[2px] bg-white/80" />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 bg-[#202C33] px-3 py-2">
        <ArrowRight className="h-5 w-5 rotate-180 text-white" />
        <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-600 font-bold text-white">
          {avatarInitial}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-white text-sm">{name}</div>
          <div className="text-[10px] text-white/70">online</div>
        </div>
        <div className="flex gap-4 pr-2 text-white">
          <MonitorSmartphone className="h-4 w-4" />
          <HeadphonesIcon className="h-4 w-4" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex h-[500px] flex-col gap-2 overflow-y-auto bg-[#0B141A] p-3 pb-6 relative" style={{ backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v3/yl/r/119h9eZ0W9N.png')", backgroundSize: 'cover', opacity: 0.95 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative max-w-[85%] rounded-lg p-1.5 ${msg.isMe ? 'bg-[#005C4B] text-white' : 'bg-[#202C33] text-white'}`}>
              {msg.image && (
                <div className="mb-1 overflow-hidden rounded border border-white/10 bg-slate-800 text-center">
                  {msg.image}
                </div>
              )}
              {msg.text && (
                <div className="px-1 text-[13px] leading-snug">
                  {msg.text}
                </div>
              )}
              <div className="flex items-center justify-end gap-1 px-1 pt-1 text-[9px] text-white/60">
                <span>{msg.time}</span>
                {msg.isMe && <CheckCircle className="h-3 w-3 text-sky-400" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 bg-[#202C33] p-2">
        <div className="flex-1 rounded-full bg-[#2A3942] px-4 py-2 text-sm text-white/50">Message</div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#00A884]">
          <Mic className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  )
}
function WhatsAppTestimonials() {
  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:justify-center">
      <WhatsAppChat
        name="Kashif batch 1"
        avatarInitial="K"
        messages={[
          {
            isMe: false,
            time: '4:13 PM',
            image: (
              <div className="flex h-48 w-full flex-col items-center justify-center bg-slate-900 text-white p-3">
                <div className="text-[10px] font-semibold text-emerald-400 w-full text-left">✓ Asset Delivered</div>
                <div className="text-sm font-bold mt-2 text-center text-slate-100">AI Product Ad Campaign</div>
                <div className="text-[10px] text-slate-400 mt-1">4K Resolution · Studio Lighting</div>
                <div className="mt-4 flex w-full justify-between text-[10px] bg-slate-800/80 rounded p-2">
                  <span>Status</span>
                  <span className="font-bold text-emerald-400">Client Approved</span>
                </div>
                <div className="mt-1 flex w-full justify-between text-[10px] bg-slate-800/80 rounded p-2">
                  <span>Format</span>
                  <span className="font-bold text-cyan-400">9:16 Video + Stills</span>
                </div>
              </div>
            ),
            text: 'Pehla AI brand ad campaign successfully complete kar ke deliver kar diya! Client ko visuals bohot pasand aye 🤗'
          },
          { isMe: false, time: '4:13 PM', text: 'Product lighting aur prompt engineering wale module se exact brand-level output aya.' },
          { isMe: false, time: '4:16 PM', text: 'Training was 100% practical and to the point.' },
          { isMe: true, time: '4:16 PM', text: 'MashAllah! Keep it up.' }
        ]}
      />

      <WhatsAppChat
        name="Nimra batch 1"
        avatarInitial="N"
        messages={[
          { isMe: true, time: '8:50 AM', text: 'Sir' },
          {
            isMe: false,
            time: '8:50 AM',
            image: (
              <div className="flex h-48 w-full flex-col items-center justify-center bg-slate-900 text-white p-3">
                <div className="text-[10px] font-semibold w-full text-left mb-2">Overview</div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="bg-slate-800 rounded p-2 text-left">
                    <div className="text-[9px] text-slate-400">Views</div>
                    <div className="font-bold text-sm">2,824,240</div>
                  </div>
                  <div className="bg-slate-800 rounded p-2 text-left">
                    <div className="text-[9px] text-slate-400">Accounts reached</div>
                    <div className="font-bold text-sm">2,170,610</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full mt-2">
                  <div className="bg-slate-800 rounded p-2 text-left">
                    <div className="text-[9px] text-slate-400">Avg watch time</div>
                    <div className="font-bold text-sm">11s</div>
                  </div>
                  <div className="bg-slate-800 rounded p-2 text-left">
                    <div className="text-[9px] text-slate-400">Follows</div>
                    <div className="font-bold text-sm">5,240</div>
                  </div>
                </div>
              </div>
            ),
            text: 'Viral 😍'
          },
          { isMe: false, time: '8:50 AM', text: 'Podcast wale lecture amazing thy aur is account pe 12k followers hogye Hain with 4m views in last 28 days💖' },
          { isMe: false, time: '8:53 AM', text: 'Also working on kids content' }
        ]}
      />
    </div>
  )
}

// ── Outcomes Grid ────────────────────────────────────────────────────────
const OUTCOMES = [
  { icon: '📸', title: 'AI Product Photography', price: 'High Demand', desc: 'Studio-quality shots for any brand.' },
  { icon: '🎬', title: 'UGC Talking Ads', price: 'In-Demand Skill', desc: 'Avatars that sell on Meta & TikTok.' },
  { icon: '🧠', title: 'AI Influencer Builds', price: 'Growing Market', desc: 'Faceless personas with real audience potential.' },
  { icon: '🛍️', title: 'E-com Creative Sets', price: 'Popular Service', desc: 'Full product creative kits per drop.' },
  { icon: '💬', title: 'Multi-language Ads', price: 'Global Reach', desc: 'Urdu, English, Arabic — one render.' },
  { icon: '🎨', title: 'Brand Style Systems', price: 'Premium Skill', desc: 'Consistent AI aesthetic per brand.' },
  { icon: '🎙️', title: 'AI Voiceover Reels', price: 'Quick Delivery', desc: 'Hooks + voice + visuals — done.' },
  { icon: '📈', title: 'Performance Creative', price: 'Agency-Level', desc: 'Iterative test creatives for ad spend.' },
]

function OutcomesGrid() {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
          Outcomes
        </div>
        <h2 className="mt-4 font-['Sora'] text-3xl font-bold tracking-tight md:-tracking-[0.02em] text-slate-900 sm:text-4xl">
          By the end of this course, you<br />will be able to:
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOMES.map((o, i) => (
            <div key={i} className="flex flex-col items-start rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md p-6 text-left shadow-glass card-premium-hover">
              <div className="text-3xl">{o.icon}</div>
              <h3 className="mt-4 font-['Sora'] font-bold text-slate-900">{o.title}</h3>
              <div className="mt-1 text-sm font-bold text-blue-600">{o.price}</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{o.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Income Potential & Roadmap ─────────────────────────────────────────────
const INCOMES = [
  { icon: <MonitorSmartphone className="h-5 w-5 text-white" />, title: 'AI Product Photography', price: 'High Demand', desc: 'Studio-grade product shots without a studio. Local + e-commerce clients.' },
  { icon: <Mic className="h-5 w-5 text-white" />, title: 'UGC Talking Ad Videos', price: 'In-Demand', desc: 'Realistic AI avatars reading scripts for brand ads on Meta & TikTok.' },
  { icon: <TrendingUp className="h-5 w-5 text-white" />, title: 'Monthly Brand Retainer', price: 'Recurring', desc: 'Recurring content packages — 8 to 30 assets per brand per month.' },
  { icon: <Star className="h-5 w-5 text-white" />, title: 'Faceless AI Influencer', price: 'Scalable', desc: 'Build an AI persona. Brand deals, affiliate, sponsorships potential.' },
]

function IncomeAndRoadmap() {
  return (
    <section className="bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        {/* Income Potential */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
            Income Potential
          </div>
          <h2 className="mt-4 font-['Sora'] text-3xl font-bold tracking-tight md:-tracking-[0.02em] text-slate-900 sm:text-4xl">
            Skills you&apos;ll master in this bootcamp
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INCOMES.map((inc, i) => (
            <div key={i} className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md p-6 shadow-glass card-premium-hover">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500">
                {inc.icon}
              </div>
              <h3 className="mt-4 font-['Sora'] text-sm font-bold text-slate-900 leading-tight">{inc.title}</h3>
              <div className="mt-1 text-sm font-bold text-blue-500">{inc.price}</div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">{inc.desc}</p>
            </div>
          ))}
        </div>

        {/* Roadmap */}
        <div className="mt-24 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
            Bootcamp Roadmap
          </div>
          <h2 className="mt-4 font-['Sora'] text-3xl font-bold tracking-tight md:-tracking-[0.02em] text-slate-900 sm:text-4xl">
            From zero to professional creator
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { day: 'PHASE 1', step: '01', title: 'Foundations', desc: 'Master the AI stack — prompts, tools, workflows.' },
            { day: 'PHASE 2', step: '02', title: 'First Asset', desc: 'Generate your first 4K AI ad. Build your portfolio.' },
            { day: 'PHASE 3', step: '03', title: 'First Project', desc: 'Outreach templates + proposals. Connect with brands.' },
            { day: 'PHASE 4', step: '04', title: 'Scale Skills', desc: 'Deliver recurring creative sets and manage client assets.' },
          ].map((r, i) => (
            <div key={i} className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md p-6 shadow-glass card-premium-hover relative pt-10">
              <div className="absolute -top-3 left-6 rounded-full bg-[#1A233A] px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest">
                {r.day}
              </div>
              <div className="font-['Sora'] text-4xl font-extrabold text-blue-600">{r.step}</div>
              <h3 className="mt-2 font-['Sora'] text-lg font-bold text-slate-900">{r.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Bonuses Bar ────────────────────────────────────────────────────────────
function BonusesBar() {
  return (
    <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl bg-[#0F172A] p-8 text-white shadow-xl">
      <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
        + BONUSES INCLUDED
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          '200+ proven AI prompts pack',
          'Cost-cutting tool stack hack',
          'Pakistan payment guide (Payoneer, Wise)',
          'Free Client Acquisition Ebook',
          'Private WhatsApp support group'
        ].map((bonus, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300">{bonus}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const SKOOL_TESTIMONIALS = [
  { title: "First AI Ad Order", tag: "Client Work", desc: "Student ne apna pehla paid AI ad order close kiya — seekha hua skill direct income mein convert hua.", image: "/skool-1.png" },
  { title: "Lectures Easy to Follow", tag: "Course Quality", desc: "Module 2 ka LLM lecture simple aur clear laga — beginners ke liye bhi samajhna asaan.", image: "/skool-2.png" },
  { title: "First Realistic AI Creation", tag: "Student Result", desc: "4th lecture ke baad realistic AI visuals banane shuru — practical results, sirf theory nahi.", image: "/skool-3.png" },
  { title: "Happy to Be Part of It", tag: "Community", desc: "Long-term plan lene ke baad community mein active participation aur clear faida.", image: "/skool-4.png" },
  { title: "Mentor Support That Cares", tag: "Mentorship", desc: "Mentor guidance aur support ki wajah se students ka confidence aur speed dono barhi.", image: "/skool-5.png" },
  { title: "2 Din Mein Hi Maza Aa Gaya", tag: "New Student", desc: "Naye student ko har lecture mein maza aa raha hai — kaafi kuch aisa seekha jo pehle pata hi nahi tha.", image: "/skool-6.png" },
  { title: "Best Investment I Made This Year!", tag: "Best Investment", desc: "Sirf 2 modules dekhne ke baad student keh raha hai ye investment har penny ke qabil — realistic teaching ne motivation double kar di.", image: "/skool-7.png" },
  { title: "1st Ad — AI Model in a Real Office", tag: "Student Result", desc: "Student ne apna pehla AI ad banaya — cousin ke real office mein AI model place karke professional result nikala.", image: "/skool-8.png" },
  { title: "Definitely Worth the Investment", tag: "New Student", desc: "Online buying thoda risky lagta hai, lekin ye course definitely worth it hai. Abhi join kiya aur is journey ka part banke excited hun.", image: "/skool-9.png", fullWidth: true }
]

function SkoolTestimonials() {
  return (
    <section className="bg-[#fafafa] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 mb-4">
            Real Community Feedback
          </div>
          <h2 className="font-['Sora'] text-3xl font-bold tracking-tight md:-tracking-[0.02em] text-slate-900 sm:text-5xl">
            What Our Students Are Saying
          </h2>
          <p className="mt-4 text-sm text-slate-600 sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Ye sab posts hamari private Skool community se hain — <span className="font-semibold text-slate-900">726+ AI creators</span> ke real results aur experiences.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {SKOOL_TESTIMONIALS.map((t, i) => (
            <div key={i} className={`flex flex-col rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md p-6 shadow-glass card-premium-hover ${t.fullWidth ? 'md:col-span-2 max-w-4xl mx-auto w-full' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-['Sora'] text-lg font-bold text-slate-900">{t.title}</h3>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{t.tag}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">{t.desc}</p>

              <div className="mt-auto w-full rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white">
                <div className="aspect-[16/9] w-full relative bg-slate-50 flex items-center justify-center">
                  <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                    <Image className="opacity-20" src="/file.svg" alt="placeholder" width={24} height={24} />
                    <span>Upload {t.image}</span>
                  </div>
                  {/* <Image src={t.image} alt={t.title} fill className="object-cover" /> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Who Is This For ────────────────────────────────────────────────────────
const AUDIENCES = [
  { icon: <Sparkles className="h-5 w-5 text-white" />, title: 'Beginner', desc: 'Zero experience? Start here. Roman Urdu friendly.' },
  { icon: <Briefcase className="h-5 w-5 text-white" />, title: 'Freelancer', desc: 'Add AI tools to your stack and offer creative services.' },
  { icon: <Users className="h-5 w-5 text-white" />, title: 'Business Owner', desc: 'Cut creative costs and ship ads in-house.' },
  { icon: <DollarSign className="h-5 w-5 text-white" />, title: 'Global Creator', desc: 'Build digital assets for international brands.' },
  { icon: <GraduationCap className="h-5 w-5 text-white" />, title: 'Student', desc: 'Learn in-demand AI creative skills at your own pace.' },
  { icon: <Rocket className="h-5 w-5 text-white" />, title: 'Creator', desc: 'Build a faceless brand with automated workflows.' },
]

function WhoIsThisFor() {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
            Who It's For
          </div>
          <h2 className="mt-4 font-['Sora'] text-3xl font-bold tracking-tight md:-tracking-[0.02em] text-slate-900 sm:text-4xl">
            If any of these is you — you're in
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((aud, i) => (
            <div key={i} className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md p-6 shadow-glass card-premium-hover">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500">
                {aud.icon}
              </div>
              <h3 className="mt-5 font-['Sora'] text-lg font-bold text-slate-900">{aud.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{aud.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const enrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent')
    }

    // Capture source from URL or Referrer and save to localStorage
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const utm = params.get('utm_source') || params.get('ref')
      if (utm) {
        localStorage.setItem('lead_source', utm.toLowerCase())
      } else if (!localStorage.getItem('lead_source') && document.referrer) {
        const ref = document.referrer.toLowerCase()
        if (ref.includes('facebook') || ref.includes('fb.com') || ref.includes('instagram')) localStorage.setItem('lead_source', 'facebook')
        else if (ref.includes('google')) localStorage.setItem('lead_source', 'google')
        else if (ref.includes('tiktok')) localStorage.setItem('lead_source', 'tiktok')
        else if (ref.includes('youtube')) localStorage.setItem('lead_source', 'youtube')
      }

      // Capture click IDs — most precise attribution signal from each ad platform
      // Only store on first touch; never overwrite (preserve the original paid click)
      const gclid = params.get('gclid')
      if (gclid && !localStorage.getItem('lead_gclid')) {
        localStorage.setItem('lead_gclid', gclid)
        // Infer source from gclid if utm_source wasn't set
        if (!localStorage.getItem('lead_source')) localStorage.setItem('lead_source', 'google')
      }

      const fbclid = params.get('fbclid')
      if (fbclid && !localStorage.getItem('lead_fbclid')) {
        localStorage.setItem('lead_fbclid', fbclid)
        if (!localStorage.getItem('lead_source')) localStorage.setItem('lead_source', 'facebook')
      }
    }

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
              <div className="font-['Sora'] text-sm font-bold tracking-tight sm:text-base">AI Bootcamp</div>
              <div className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Pakistan</div>
            </div>
          </a>

          <div className="hidden items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 md:flex">
            <GraduationCap className="h-3.5 w-3.5" />
            <span className="animate-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
            {ENROLLED}+ Students Enrolled
          </div>

          <Link
            href="/enroll"
            className="btn-premium inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white sm:text-sm"
          >
            Enroll Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section id="top" className="hero-bg relative overflow-hidden dot-grid">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-8 text-center sm:px-6 sm:pb-8 sm:pt-12 md:pt-10">

          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-blue-700 shadow-sm backdrop-blur sm:text-xs">
            🎓 Structured AI Skills Course · 10 Modules
          </span>

          <h1 className="mx-auto mt-3 max-w-4xl text-balance font-['Sora'] text-[28px] font-bold leading-[1.15] tracking-tight md:-tracking-[0.02em] text-slate-900 sm:text-4xl md:text-5xl">
            Learn <span className="text-gradient">AI Content Creation</span> — From Zero to Professional
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-balance text-sm leading-relaxed text-slate-500 sm:text-base">
            A structured 10-module course teaching you to create professional AI images, product photography, videos, and talking ads. No prior experience or expensive equipment needed.
          </p>

          {/* <div className="mt-2 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/50 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
              <span className="animate-bounce">👇</span> Watch the 3-minute intro below
            </span>
          </div>

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
          </div> */}

          {/* CTAs */}
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/enroll"
              className="btn-premium inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white sm:w-auto sm:text-base"
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
              🎓 Hosted on Skool
            </span>
          </div>
        </div>
      </section>

      {/* ── Community Section ── */}
      <section className="px-4 pt-8 pb-14 sm:px-6 sm:pt-10 sm:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-['Sora'] text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
            Inside the <span className="text-gradient">AI Bootcamp PK</span> Skool Community
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Join over 1.1k members. Unlock courses, climb the leaderboards to win prizes, and network with Pakistan's top AI creators.
          </p>
          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Image src="/community.png" alt="AI Bootcamp PK Skool Community" width={1200} height={800} className="w-full h-auto object-cover" />
          </div>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/enroll" className="btn-premium inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-white sm:w-auto">
              Enroll Now — PKR {PRICE.toLocaleString()} <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#reviews" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto">
              Read Reviews <ArrowDown className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="gradient-brand overflow-hidden border-y border-blue-400/30 py-3 text-white">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-sm font-semibold">
          {[...Array(3)].flatMap(() => [
            `✦ Rs. ${PRICE.toLocaleString()} One-Time Payment`,
            `✦ ${ENROLLED}+ Students Enrolled`,
            '✦ 10 Complete Video Modules',
            '✦ Lifetime Access Included',
            '✦ Free Bonus Tools & Templates',
            '✦ 4-Module Refund Policy',
          ]).map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              {item} <span className="opacity-40">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Enrollment Pricing Card ── */}
      <section ref={enrollRef} id="enroll" className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white p-8 shadow-glow sm:p-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                <GraduationCap className="h-3.5 w-3.5" /> Full Course Enrollment
              </div>

              <div className="mt-5 flex flex-col sm:flex-row sm:items-baseline gap-2">
                <div className="font-['Sora'] text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                  Rs. {PRICE.toLocaleString()}
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  One-time payment · No hidden fees · Lifetime access
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-500 max-w-xl">
                Join {ENROLLED}+ students in Pakistan mastering practical AI content creation, product photography, video production, and client workflows.
              </p>

              <Link
                href="/enroll"
                className="btn-premium mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white"
              >
                Enroll Now — Rs. {PRICE.toLocaleString()} <ArrowRight className="h-5 w-5" />
              </Link>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Lock className="h-3.5 w-3.5 text-blue-600" /> Secure checkout · 100% Refund Policy Included
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


            </div>
          </div>
          <BonusesBar />
        </div>
      </section>

      {/* ── Success Stories ── */}
      <section className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Student Showcase
            </div>
            <h2 className="mt-3 font-['Sora'] text-3xl font-bold tracking-tight md:-tracking-[0.02em] text-slate-900 sm:text-4xl">
              Real Work Created by Students
            </h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Practical output examples created using the AI workflows taught inside the curriculum.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { stat: '4K Studio', desc: 'Commercial product photography created with matched lighting & shadows.', tag: 'AI Product Shoot' },
              { stat: '2.8M Views', desc: 'Organic reach on a single AI podcast video with custom voiceovers.', tag: 'Content Reach' },
              { stat: 'Client-Ready', desc: 'Brand-ready video ads and portfolio assets delivered for live campaigns.', tag: 'Client Projects' },
            ].map((story, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md p-6 shadow-glass card-premium-hover">
                <div className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{story.tag}</div>
                <div className="mt-3 font-['Sora'] text-2xl font-extrabold text-gradient">{story.stat}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{story.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Modules ── */}
      <section id="modules" className="bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Curriculum
            </div>
            <h2 className="mt-3 font-['Sora'] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              10 Modules. Zero Fluff.
            </h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Every module is designed to build practical, portfolio-ready skills. No theory for theory&apos;s sake.
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
      <section id="reviews" className="px-4 py-10 sm:px-6 sm:py-16">
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
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md p-5 shadow-glass card-premium-hover">
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

      <OutcomesGrid />
      <IncomeAndRoadmap />

      <WhoIsThisFor />

      {/* ── FAQ ── */}
      <section className="bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 mb-4">
              FAQ
            </div>
            <h2 className="font-['Sora'] text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to know</h2>
          </div>
          <div className="mt-8">
            <FAQ />
          </div>
        </div>
      </section>

      {/* ── Skool Testimonials ── */}
      {/* <SkoolTestimonials /> */}

      {/* ── Final CTA ── */}
      <section className="bg-[#0F172A] px-4 py-10 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <Clock className="mx-auto h-8 w-8 mb-6 text-cyan-400" />
          <h2 className="font-['Sora'] text-3xl font-bold leading-tight sm:text-5xl">
            Start building practical <span className="text-blue-400">AI skills</span> today.
          </h2>
          <Link
            href="/enroll"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
          >
            Enroll Now <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="bg-white px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Zap className="mx-auto h-8 w-8 mb-4 text-blue-600" />
          <h2 className="font-['Sora'] text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Start <span className="text-blue-500">today.</span>
          </h2>
          <p className="mt-4 text-sm text-slate-500 sm:text-base max-w-md mx-auto">
            Rs. {PRICE.toLocaleString()} one-time. Lifetime access. Money-back guarantee — see our <Link href="/terms" className="underline hover:text-blue-400">refund policy</Link>.
          </p>
          <Link
            href="/enroll"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
          >
            Enroll Now <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Educational & Trademark Disclaimer */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-6 sm:px-6 space-y-2">
        <p className="mx-auto max-w-4xl text-center text-[11px] leading-relaxed text-slate-500">
          <strong>Educational Disclaimer:</strong> AI Bootcamp Pakistan is a digital educational training service. Results depend on individual effort, skill level, practice, and market conditions. We do not guarantee any specific income, earnings, or financial outcomes. See our <Link href="/terms" className="underline hover:text-slate-700">Terms of Service</Link>, <Link href="/privacy" className="underline hover:text-slate-700">Privacy Policy</Link>, and <Link href="/refund" className="underline hover:text-slate-700">Refund Policy</Link> for details.
        </p>
        <p className="mx-auto max-w-4xl text-center text-[10px] leading-relaxed text-slate-400">
          <strong>Trademark Notice:</strong> All product names, logos, brands, and trademarks (including Midjourney, ElevenLabs, Runway, Kling, Suno, CapCut) are property of their respective owners. AI Bootcamp Pakistan is an independent educational program and is not affiliated with, endorsed by, or sponsored by these entities.
        </p>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-slate-900 px-4 py-10 text-white/70 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white font-bold text-sm">AI</div>
            <div>
              <div className="font-['Sora'] text-sm font-bold text-white">AI Bootcamp Pakistan</div>
              <div className="text-[11px] text-white/50">
                Contact: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-cyan-400 hover:underline">{SUPPORT_EMAIL}</a>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/60 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/refund" className="text-white/60 hover:text-white transition-colors">Refund Policy</Link>
            <Link href="/contact" className="text-white/60 hover:text-white transition-colors">Contact Us</Link>
            <a href="https://instagram.com/aivideobootcamppk" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">Instagram</a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">WhatsApp</a>
          </div>
          <div className="text-xs text-white/40">© 2026 AI Bootcamp Pakistan. All rights reserved.</div>
        </div>
      </footer>

      {/* ── Floating WhatsApp ── */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl sm:bottom-6 sm:right-6"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 5.834h-.004c-1.271-.05-2.521-.349-3.67-.877l-.263-.119-2.727.716.73-2.66-.172-.273a7.53 7.53 0 0 1-1.16-4.03c0-4.188 3.406-7.592 7.594-7.592 4.188 0 7.592 3.404 7.592 7.592 0 4.188-3.404 7.593-7.592 7.593m6.743-13.831c-1.807-1.808-4.209-2.804-6.765-2.804-5.27 0-9.56 4.29-9.56 9.56 0 1.683.439 3.321 1.271 4.762l-1.351 4.94 5.051-1.324a9.55 9.55 0 0 0 4.589 1.173c5.27 0 9.56-4.29 9.56-9.56 0-2.556-.996-4.958-2.795-6.767" />
        </svg>
      </a>


    </div>
  )
}
