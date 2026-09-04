'use client'
import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, User, Wallet, Upload, Check,
  Lock, LoaderCircle, Copy, Shield, Image as ImageIcon,
  AlertCircle, CheckCircle, MessageCircle, Star, Sparkles,
  XCircle, CameraOff, FileCheck
} from 'lucide-react'

const BASE_PRICE = 1999
const VAULT_PRICE = 499
const META_ADS_PRICE = 999

const EASYPAISA_NUMBER = process.env.NEXT_PUBLIC_EASYPAISA_NUMBER ?? '03458996578'
const JAZZCASH_NUMBER  = process.env.NEXT_PUBLIC_JAZZCASH_NUMBER  ?? '03180236635'
const HBL_ACCOUNT      = process.env.NEXT_PUBLIC_HBL_ACCOUNT      ?? '22567902223303'
const ACCOUNT_TITLE    = process.env.NEXT_PUBLIC_ACCOUNT_TITLE    ?? 'Farman Ali'
const WHATSAPP_SUPPORT = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT ?? '923180298090'

const STEP_LABELS: Record<number, string> = { 1: 'Your Details', 2: 'Send Payment', 3: 'Upload Proof' }

function getGAClientId(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(/_ga=(?:GA\d\.\d\.)?(\d+\.\d+)/)
  return match ? match[1] : undefined
}

function getGASessionId(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const cookies = document.cookie.split(';')
  for (const c of cookies) {
    const trimmed = c.trim()
    if (trimmed.startsWith('_ga_')) {
      const parts = trimmed.split('=')
      if (parts[1]) {
        const gsParts = parts[1].split('.')
        if (gsParts.length >= 3 && /^\d+$/.test(gsParts[2])) {
          return gsParts[2]
        }
      }
    }
  }
  return undefined
}


function fireGA4Event(eventName: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined' || !(window as any).gtag) return
  ;(window as any).gtag('event', eventName, params)
}

function normalizePhoneForGoogle(phone?: string | null): string {
  if (!phone) return ''
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    digits = '+92' + digits.slice(1)
  } else if (digits.startsWith('92')) {
    digits = '+' + digits
  } else if (digits.length === 10 && digits.startsWith('3')) {
    digits = '+92' + digits
  } else if (!digits.startsWith('+') && digits.length > 0) {
    digits = '+' + digits
  }
  return digits
}

function normalizePhoneForMeta(phone?: string | null): string {
  if (!phone) return ''
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    digits = '92' + digits.slice(1)
  } else if (digits.length === 10 && digits.startsWith('3')) {
    digits = '92' + digits
  }
  return digits
}

/**
 * Sets Google Enhanced Conversions & Meta Pixel Advanced Matching on browser
 */
function setEnhancedConversionsUserData(email?: string | null, phone?: string | null, fullName?: string | null, externalId?: string | null) {
  if (typeof window === 'undefined') return

  const cleanEmail = email?.trim().toLowerCase() || ''
  const googlePhone = normalizePhoneForGoogle(phone)
  const metaPhone = normalizePhoneForMeta(phone)
  const nameParts = (fullName || '').trim().split(/\s+/)
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // 1. Google Enhanced Conversions (Browser / Web)
  if ((window as any).gtag && (cleanEmail || googlePhone)) {
    try {
      ;(window as any).gtag('set', 'user_data', {
        ...(cleanEmail ? { email: cleanEmail } : {}),
        ...(googlePhone ? { phone_number: googlePhone } : {}),
        address: {
          ...(firstName ? { first_name: firstName } : {}),
          ...(lastName ? { last_name: lastName } : {}),
          country: 'PK',
        },
      })
    } catch (e) {
      console.warn('Google Enhanced Conversions error:', e)
    }
  }

  // 2. Meta Pixel Advanced Matching (Browser)
  if ((window as any).fbq && (cleanEmail || metaPhone)) {
    try {
      const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || '2170349516868440'
      ;(window as any).fbq('init', pixelId, {
        ...(cleanEmail ? { em: cleanEmail } : {}),
        ...(metaPhone ? { ph: metaPhone } : {}),
        ...(firstName ? { fn: firstName.toLowerCase() } : {}),
        ...(lastName ? { ln: lastName.toLowerCase() } : {}),
        ...(externalId ? { external_id: externalId } : {}),
      })
    } catch (e) {
      console.warn('Meta Pixel Advanced Matching error:', e)
    }
  }
}


// ── Step Indicator ─────────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  return (
    <div className="mb-4 flex items-center gap-1.5 sm:gap-2">
      {[1, 2, 3].map((s, i) => {
        const done = s < step
        const active = s === step
        return (
          <div key={s} className="flex flex-1 items-center gap-1.5 sm:gap-2">
            <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold sm:h-8 sm:w-8 sm:text-sm
              ${done ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white' :
                active ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_0_16px_rgba(37,99,235,0.4)]' :
                'bg-slate-100 text-slate-400'}`}>
              {done ? <Check className="h-4 w-4" /> : s}
            </div>
            <div className="min-w-0 flex-1">
              <div className={`truncate text-[10px] font-semibold uppercase tracking-wider sm:text-xs
                ${done || active ? 'text-slate-800' : 'text-slate-400'}`}>
                {STEP_LABELS[s]}
              </div>
              {i < 2 && <div className="mt-1 hidden h-px w-full bg-slate-200 sm:block" />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1 — Details & Upgrades ─────────────────────────────────────────────
function Step1({ onDone }: {
  onDone: (leadId: string, data: { name: string; email: string; whatsapp: string; totalAmount: number; selectedUpsells: string[] }) => void
}) {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [wa, setWa]             = useState('')
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>([])
  const [err, setErr]           = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const toggleUpsell = (key: string) => {
    setSelectedUpsells(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const hasVault = selectedUpsells.includes('vault')
  const hasMetaAds = selectedUpsells.includes('meta_ads')
  const totalAmount = BASE_PRICE + (hasVault ? VAULT_PRICE : 0) + (hasMetaAds ? META_ADS_PRICE : 0)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!name.trim() || name.length < 2) return setErr('Please enter your full name.')
    if (!/^\S+@\S+\.\S+$/.test(email))    return setErr('Please enter a valid email address.')
    if (!/^[+\d\s-]{7,20}$/.test(wa))     return setErr('Please enter a valid WhatsApp number.')

    setLoading(true)
    try {
      const params = new URLSearchParams(window.location.search)
      let source = params.get('utm_source') || params.get('ref') || localStorage.getItem('lead_source')
      
      if (!source && document.referrer) {
        const ref = document.referrer.toLowerCase()
        if (ref.includes('facebook') || ref.includes('fb.com') || ref.includes('instagram')) source = 'facebook'
        else if (ref.includes('google')) source = 'google'
        else if (ref.includes('tiktok')) source = 'tiktok'
        else if (ref.includes('youtube')) source = 'youtube'
      }
      
      source = source || 'direct'

      const utm_medium   = params.get('utm_medium')   || localStorage.getItem('lead_utm_medium')   || undefined
      const utm_campaign = params.get('utm_campaign') || localStorage.getItem('lead_utm_campaign') || undefined
      const utm_content  = params.get('utm_content')  || localStorage.getItem('lead_utm_content')  || undefined

      const leadEventId = crypto.randomUUID()
      const gaClientId = getGAClientId()
      const gaSessionId = getGASessionId()
      const gclid = localStorage.getItem('lead_gclid') || params.get('gclid') || undefined
      const wbraid = localStorage.getItem('lead_wbraid') || params.get('wbraid') || undefined
      const gbraid = localStorage.getItem('lead_gbraid') || params.get('gbraid') || undefined
      const fbclid = localStorage.getItem('lead_fbclid') || params.get('fbclid') || undefined

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          whatsapp: wa.trim(),
          total_amount: totalAmount,
          selected_upsells: selectedUpsells,
          source,
          utm_medium,
          utm_campaign,
          utm_content,
          gclid,
          wbraid,
          gbraid,
          fbclid,
          ga_client_id: gaClientId,
          ga_session_id: gaSessionId,
          eventId: leadEventId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Set Google Enhanced Conversions & Meta Pixel Advanced Matching in browser immediately
      setEnhancedConversionsUserData(email, wa, name, data.id)

      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', { value: totalAmount, currency: 'PKR' }, { eventID: leadEventId })
      }

      if (!data.existing) {
        // GA4 Lead event (with Enhanced Conversions attached)
        fireGA4Event('generate_lead', { value: totalAmount, currency: 'PKR' })
      }


      onDone(data.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: wa.trim(),
        totalAmount,
        selectedUpsells,
      })
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-0.5">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <h2 className="font-['Sora'] text-lg sm:text-xl font-extrabold leading-tight text-slate-900">
            Reserve Your Seat
          </h2>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400" />)}
            </div>
            <span className="font-bold text-slate-700">4.9/5</span>
            <span>(1,120+ Enrolled)</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="rounded-full bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-xs font-black text-blue-700">
            Rs. {BASE_PRICE.toLocaleString()}
          </span>
          <div className="text-[9px] font-semibold text-blue-600">
            Save 65%
          </div>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        {/* Full Name */}
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name *</span>
          <input type="text" value={name} onChange={e => setName(e.target.value)} maxLength={100}
            placeholder="e.g. Ali Khan" required
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" />
        </label>

        {/* Email */}
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Email *</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={255}
            placeholder="you@example.com" required
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" />
        </label>

        {/* WhatsApp */}
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">WhatsApp Number *</span>
          <input type="tel" value={wa} onChange={e => setWa(e.target.value)} maxLength={20}
            placeholder="03XXXXXXXXX" required
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" />
        </label>
      </div>

      {/* ── Order Bumps / Upgrades ───────────────────────────────────────── */}
      <div className="pt-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Exclusive Upgrades (Optional)
          </span>
          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-full">
            SAVE 80%
          </span>
        </div>

        {/* Upsell 1: AI Creator's Cheat Code Vault */}
        <div
          onClick={() => toggleUpsell('vault')}
          className={`group relative cursor-pointer select-none rounded-xl border p-2 sm:p-2.5 transition-all duration-200 ${
            hasVault
              ? 'border-blue-500 bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white shadow-[0_2px_12px_rgba(37,99,235,0.12)] ring-1 ring-blue-500/30'
              : 'border-slate-200/90 bg-white hover:border-blue-300 hover:bg-slate-50/70 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`grid h-4.5 w-4.5 shrink-0 place-items-center rounded-md border text-white transition-all ${
              hasVault ? 'border-blue-600 bg-gradient-to-br from-blue-600 to-cyan-500 shadow-2xs' : 'border-slate-300 bg-slate-50 group-hover:border-slate-400'
            }`}>
              {hasVault && <Check className="h-3 w-3 stroke-[3]" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="rounded bg-gradient-to-r from-orange-500 to-amber-500 px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider text-white shadow-2xs">
                    SPECIAL
                  </span>
                  <span className="font-['Sora'] text-xs sm:text-[13px] font-bold text-slate-900 leading-none">
                    AI Cheat Code Vault
                  </span>
                </div>
                <span className="shrink-0 text-xs sm:text-[13px] font-black text-blue-600">
                  +Rs. {VAULT_PRICE}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] sm:text-[11px] leading-tight text-slate-500">
                50+ Midjourney prompts, 5 HD avatars, outreach scripts &amp; blueprints.
              </p>
            </div>
          </div>
        </div>

        {/* Upsell 2: Meta Ads Masterclass */}
        <div
          onClick={() => toggleUpsell('meta_ads')}
          className={`group relative cursor-pointer select-none rounded-xl border p-2 sm:p-2.5 transition-all duration-200 ${
            hasMetaAds
              ? 'border-indigo-500 bg-gradient-to-r from-indigo-50/90 via-purple-50/40 to-white shadow-[0_2px_12px_rgba(99,102,241,0.12)] ring-1 ring-indigo-500/30'
              : 'border-slate-200/90 bg-white hover:border-indigo-300 hover:bg-slate-50/70 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`grid h-4.5 w-4.5 shrink-0 place-items-center rounded-md border text-white transition-all ${
              hasMetaAds ? 'border-indigo-600 bg-gradient-to-br from-indigo-600 to-purple-500 shadow-2xs' : 'border-slate-300 bg-slate-50 group-hover:border-slate-400'
            }`}>
              {hasMetaAds && <Check className="h-3 w-3 stroke-[3]" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="rounded bg-gradient-to-r from-purple-600 to-indigo-600 px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider text-white shadow-2xs">
                    PREMIUM
                  </span>
                  <span className="font-['Sora'] text-xs sm:text-[13px] font-bold text-slate-900 leading-none">
                    Meta Ads Masterclass
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-slate-400 line-through hidden xs:inline">Rs 4,999</span>
                  <span className="text-xs sm:text-[13px] font-black text-indigo-600">
                    +Rs. {META_ADS_PRICE}
                  </span>
                </div>
              </div>
              <p className="mt-0.5 text-[10px] sm:text-[11px] leading-tight text-slate-500">
                Master Facebook &amp; Instagram Ads to scale and land high-paying clients.
              </p>
            </div>
          </div>
        </div>
      </div>

      {err && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {err}
        </div>
      )}

      {/* ── Dual-Action Apple/Linear Style Submit Button ─────────────────── */}
      <button type="submit" disabled={loading}
        className="mt-3.5 group relative inline-flex w-full items-center justify-between overflow-hidden rounded-full p-1.5 pr-4 sm:pr-5 text-white shadow-[0_4px_24px_rgba(37,99,235,0.38)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
        style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
        
        {/* Dynamic Price Pill on Left */}
        <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-2 text-xs sm:text-sm font-black backdrop-blur-md">
          <span>Rs. {totalAmount.toLocaleString()}</span>
          {selectedUpsells.length > 0 && (
            <span className="rounded-full bg-emerald-400 px-1.5 py-0.5 text-[8.5px] text-emerald-950 font-black uppercase tracking-wider">
              +{selectedUpsells.length} UP
            </span>
          )}
        </div>

        {/* Action text on Right */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-wide">
          {loading ? (
            <><LoaderCircle className="h-4 w-4 animate-spin" /> Saving…</>
          ) : (
            <>Continue to Payment <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
          )}
        </div>
      </button>

      <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Lock className="h-3.5 w-3.5" /> Your details are private — used only to send your access.
      </p>
    </form>
  )
}

// ── BankRow helper ───────────────────────────────────────────────────────
function BankRow({ bank, title, num, colorClass = "text-slate-500" }: { bank: string; title?: string; num: string; colorClass?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(num)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 py-3 sm:py-4 last:border-0">
      <div className="min-w-0">
        <div className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${colorClass}`}>{bank}</div>
        {title && <div className="mt-0.5 text-xs text-slate-500">{title}</div>}
        <div className="mt-0.5 sm:mt-1 text-xs sm:text-base font-semibold tracking-wide text-slate-800">{num}</div>
      </div>
      <button onClick={copy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white shadow-xs px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300">
        {copied ? <><Check className="h-3.5 w-3.5 text-blue-600" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
      </button>
    </div>
  )
}

// ── Step 2 — Payment Options ────────────────────────────────────────────────
function Step2({
  userData,
  onContinue,
  onBack,
}: {
  userData: { name: string; email: string; whatsapp: string; totalAmount: number; selectedUpsells: string[] }
  onContinue: () => void
  onBack: () => void
}) {
  // Fire 2nd Lead event when Step 2 renders
  useEffect(() => {
    setEnhancedConversionsUserData(userData.email, userData.whatsapp, userData.name)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        value: userData.totalAmount,
        currency: 'PKR',
      })
    }
  }, [userData.totalAmount, userData.email, userData.whatsapp, userData.name])

  const handleContinue = () => {
    // Fire 1st InitiateCheckout event on Step 2 submit
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        value: userData.totalAmount,
        currency: 'PKR',
      })
    }
    onContinue()
  }

  const upsellLabels: string[] = []
  if (userData.selectedUpsells?.includes('vault')) upsellLabels.push("AI Cheat Code Vault")
  if (userData.selectedUpsells?.includes('meta_ads')) upsellLabels.push("Meta Ads Masterclass")
  const bundleText = upsellLabels.length > 0 ? ` + ${upsellLabels.join(' + ')}` : ''

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
          <Wallet className="h-3.5 w-3.5" /> Step 2 of 3
        </div>
        <span className="rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-1 text-xs font-black text-blue-700">
          Rs. {userData.totalAmount.toLocaleString()}
        </span>
      </div>

      <h2 className="mt-1.5 font-['Sora'] text-xl sm:text-2xl font-extrabold leading-tight text-slate-900">
        Send Your Payment.
      </h2>
      <p className="mt-1.5 flex items-center gap-1 text-xs sm:text-sm text-slate-500">
        <Lock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
        Send <strong className="text-slate-800 mx-1">exactly Rs. {userData.totalAmount.toLocaleString()}</strong> to any account below:
      </p>

      {/* Selected Items Notice */}
      {upsellLabels.length > 0 && (
        <div className="mt-2.5 rounded-xl border border-blue-200 bg-blue-50/70 p-2.5 text-xs text-blue-900">
          <span className="font-bold">Includes:</span> AI Video Bootcamp {bundleText}
        </div>
      )}

      {/* Payment Options */}
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-2xs">
        <BankRow bank="EasyPaisa" title={ACCOUNT_TITLE} num={EASYPAISA_NUMBER} colorClass="text-emerald-600" />
        {JAZZCASH_NUMBER && <BankRow bank="JazzCash" num={JAZZCASH_NUMBER} colorClass="text-rose-600" />}
        {HBL_ACCOUNT && <BankRow bank="HBL (Bank Transfer)" title={ACCOUNT_TITLE} num={HBL_ACCOUNT} colorClass="text-teal-700" />}
      </div>

      <button onClick={handleContinue}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-transform hover:scale-[1.01] cursor-pointer"
        style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
        I&apos;ve Sent the Payment — Continue <ArrowRight className="h-4.5 w-4.5" />
      </button>

      {/* Direct WhatsApp Support Assistance Button */}
      <div className="mt-3.5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 text-left shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white shadow-xs">
            <MessageCircle className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Having trouble paying or need help?</h4>
            <p className="mt-0.5 text-xs text-slate-600">
              Our team is online right now to assist you step-by-step on WhatsApp.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(`Hi! I am on Step 2 (Payment) for the AI Bootcamp${bundleText} (Rs. ${userData.totalAmount.toLocaleString()}) and I need help completing my payment.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Facing Issue? Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
      <button onClick={onBack}
        className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 cursor-pointer">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Lock className="h-3.5 w-3.5" /> Secure · One-time payment · Lifetime access
      </p>
    </div>
  )
}

// ── Util: Compress Image ───────────────────────────────────────────────────
function compressImageToBase64(file: File, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const rawBase64 = ((e.target?.result as string) || '').split(',')[1] || ''
      try {
        const img = new Image()
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (!ctx) return resolve(rawBase64)
            ctx.drawImage(img, 0, 0, width, height)
            const dataUrl = canvas.toDataURL('image/jpeg', quality)
            resolve(dataUrl.split(',')[1] || rawBase64)
          } catch {
            resolve(rawBase64)
          }
        }
        img.onerror = () => resolve(rawBase64)
        img.src = e.target?.result as string
      } catch {
        resolve(rawBase64)
      }
    }
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })
}

// ── Step 3 — Upload Proof ──────────────────────────────────────────────────
function Step3({
  leadId,
  onBack,
  userData,
}: {
  leadId: string
  onBack: () => void
  userData: { name: string; email: string; whatsapp: string; totalAmount: number; selectedUpsells: string[] }
}) {
  const [file, setFile]           = useState<File | null>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [verified, setVerified]   = useState(false)
  const [allowManual, setAllowManual] = useState(false)
  const [rejectionCode, setRejectionCode] = useState<string | null>(null)
  const [verifyResult, setVerifyResult] = useState<Record<string, unknown> | null>(null)
  const [imageHash, setImageHash] = useState<string | null>(null)
  const [err, setErr]             = useState<string | null>(null)
  const [urduErr, setUrduErr]     = useState<string | null>(null)
  const [done, setDone]           = useState(false)

  // Fire 2nd InitiateCheckout event when Step 3 renders
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        value: userData.totalAmount,
        currency: 'PKR',
      })
    }
  }, [userData.totalAmount])

  const upsellLabels: string[] = []
  if (userData.selectedUpsells?.includes('vault')) upsellLabels.push("AI Cheat Code Vault")
  if (userData.selectedUpsells?.includes('meta_ads')) upsellLabels.push("Meta Ads Masterclass")
  const bundleText = upsellLabels.length > 0 ? ` + ${upsellLabels.join(' + ')}` : ''

  const handleFile = useCallback(async (f: File | null | undefined) => {
    if (!f) return
    setErr(null)
    setUrduErr(null)
    setVerified(false)
    setAllowManual(false)
    setRejectionCode(null)
    setVerifyResult(null)
    setImageHash(null)
    setPreview(null)

    if (!f.type.startsWith('image/')) {
      setErr('Please upload an image file (PNG, JPG, etc.)')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setErr('Image must be under 10MB.')
      return
    }

    setFile(f)
    setPreview(URL.createObjectURL(f))
    setVerifying(true)

    try {
      const base64 = await compressImageToBase64(f)
      const res = await fetch('/api/verify-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64,
          contentType: f.type || 'image/jpeg',
          localTime: new Date().toString(),
          expectedAmount: userData.totalAmount,
        }),
      })
      const data = await res.json()
      setVerifyResult(data)
      setImageHash(data.imageHash || null)
      setRejectionCode(data.rejection_code || null)
      setAllowManual(Boolean(data.allowManualSubmission))

      if (data.valid) {
        setVerified(true)
        setErr(null)
        setUrduErr(null)
      } else {
        setVerified(false)
        setErr(data.reason ?? 'Screenshot could not be auto-verified by AI.')
        setUrduErr(data.urdu_reason ?? null)
      }
    } catch {
      setVerified(false)
      setAllowManual(true)
      setErr('Auto-verification check is busy. You can submit your screenshot directly for instant manual approval.')
      setUrduErr('سسٹم مصروف ہے۔ آپ دستی تصدیق کے لیے جمع کروا سکتے ہیں۔')
    } finally {
      setVerifying(false)
    }
  }, [userData.totalAmount])

  const submit = async () => {
    if (!file || (!verified && !allowManual)) return
    setSubmitting(true); setErr(null); setUrduErr(null)

    try {
      const base64 = await compressImageToBase64(file)
      const purchaseEventId = crypto.randomUUID()

      const res = await fetch('/api/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          fileBase64: base64,
          contentType: 'image/jpeg',
          fileName: file.name,
          imageHash,
          aiResult: verifyResult,
          transactionId: (verifyResult as Record<string,unknown>)?.transactionId,
          amount: userData.totalAmount,
          recipientNumber: (verifyResult as Record<string,unknown>)?.recipientNumber,
          senderName: (verifyResult as Record<string,unknown>)?.senderName,
          direction: (verifyResult as Record<string,unknown>)?.direction,
          eventId: purchaseEventId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const finalPrice = Number(userData.totalAmount) || 1999

      if (!data.alreadyTracked) {
        // Set user data for Purchase conversion matching
        setEnhancedConversionsUserData(userData.email, userData.whatsapp, userData.name, leadId)

        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Purchase', { value: finalPrice, currency: 'PKR' }, { eventID: purchaseEventId })
        }



        fireGA4Event('purchase', {
          transaction_id: (verifyResult as Record<string,unknown>)?.transactionId || purchaseEventId,
          value: finalPrice,
          currency: 'PKR',
          items: [{
            item_id: 'ai-bootcamp-pk',
            item_name: 'AI Video Bootcamp Pakistan',
            price: finalPrice,
            quantity: 1,
          }],
        })
      }

      setDone(true)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Upload failed. Please try again.')
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]"
          style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-['Sora'] text-2xl font-extrabold"
          style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          You&apos;re In!
        </h2>
        <p className="mt-3 text-sm text-slate-800 font-semibold leading-relaxed max-w-sm mx-auto">
          Payment screenshot received! Message us on WhatsApp now — we&apos;ll send you the final student form and your course access.
        </p>
        <a href={`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(`Hi! I've submitted my payment of Rs. ${userData.totalAmount.toLocaleString()} for the AI Video Bootcamp${bundleText}.\nName: ${userData.name || 'Student'}\nEmail: ${userData.email || ''}\nWhatsApp: ${userData.whatsapp || ''}\n\nPlease confirm my enrollment.`)}`}
          target="_blank" rel="noopener noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]">
          <MessageCircle className="h-5 w-5" />
          Message us on WhatsApp
        </a>
      </div>
    )
  }

  const isHardRejected = !verified && file && !verifying && !allowManual
  const isSelfie = rejectionCode === 'SELFIE_DETECTED'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
          <Upload className="h-3.5 w-3.5" /> Step 3 of 3
        </div>
        <span className="rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-1 text-xs font-black text-blue-700">
          Rs. {userData.totalAmount.toLocaleString()}
        </span>
      </div>

      <h2 className="mt-1.5 font-['Sora'] text-xl sm:text-2xl font-extrabold leading-tight text-slate-900">
        Upload Payment Screenshot
      </h2>
      <p className="mt-1 text-xs sm:text-sm text-slate-500">
        Upload the transfer receipt of <strong className="text-slate-800">Rs. {userData.totalAmount.toLocaleString()}</strong> from EasyPaisa, JazzCash, or your Bank App.
      </p>

      {/* ── Visual Upload Guidelines Box ──────────────────────────────────── */}
      <div className="mt-3.5 space-y-2">
        {/* Valid item example */}
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 text-xs text-emerald-900">
          <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div>
            <span className="font-bold">What to upload:</span> Screenshot of Successful Transfer from EasyPaisa / JazzCash / Bank app saved in your Gallery.
          </div>
        </div>

        {/* Warning: No Selfies / Photos */}
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/70 p-2.5 text-xs text-rose-900">
          <CameraOff className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <div className="space-y-0.5">
            <div>
              <span className="font-bold text-rose-700">DO NOT upload selfies or personal photos.</span>
            </div>
            <div className="text-[11px] font-medium text-rose-800" dir="rtl">
              براہ کرم اپنی تصویر یا سیلفی مت لگائیں — صرف پیمنٹ رسید (Screenshot) لگائیں۔
            </div>
          </div>
        </div>
      </div>

      {/* ── Drop / Select zone ────────────────────────────────────────────── */}
      <label className={`mt-3.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
        isHardRejected
          ? 'border-rose-300 bg-rose-50/40 hover:border-rose-400'
          : verified
          ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400'
          : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40'
      }`}>
        {preview
          ? <img src={preview} alt="Preview" className="max-h-44 rounded-lg object-contain border border-slate-200" />
          : <>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-50 text-blue-600">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="text-sm font-bold text-slate-700">Choose Screenshot from Gallery</div>
              <div className="text-xs text-slate-400">PNG, JPG, HEIC · up to 10MB</div>
            </>}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
      </label>

      {file && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate max-w-[200px]">Selected: <strong className="text-slate-700">{file.name}</strong></span>
          <label className="text-blue-600 font-semibold cursor-pointer hover:underline">
            Change Photo
            <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
          </label>
        </div>
      )}

      {/* ── State: Scanning with AI ──────────────────────────────────────── */}
      {verifying && (
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3 text-xs font-semibold text-blue-800 shadow-2xs">
          <LoaderCircle className="h-4 w-4 animate-spin text-blue-600 shrink-0" />
          <span>Scanning payment receipt with AI…</span>
        </div>
      )}

      {/* ── State: Verified Successfully ─────────────────────────────────── */}
      {verified && !verifying && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-emerald-800">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Receipt Verified Successfully ✓
          </div>
          {Boolean((verifyResult as any)?.transaction_id) && (
            <div className="mt-1 text-[11px] text-emerald-700">
              TRX ID: <span className="font-mono font-semibold">{(verifyResult as any).transaction_id}</span>
            </div>
          )}
        </div>
      )}

      {/* ── State: HARD REJECTION (Selfie / Non-Receipt) ──────────────────── */}
      {isHardRejected && (
        <div className="mt-3 rounded-xl border-2 border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-900 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div className="space-y-1.5 flex-1">
              <div className="font-extrabold text-rose-900 text-sm">
                {isSelfie ? 'Selfie / Personal Photo Detected ❌' : 'Not a Payment Receipt ❌'}
              </div>
              <div className="text-slate-700 leading-snug">
                {err || 'Please upload a screenshot of your payment transfer from EasyPaisa or JazzCash.'}
              </div>
              {urduErr && (
                <div className="rounded-lg bg-white/80 p-2 font-bold text-rose-900 text-xs border border-rose-200" dir="rtl">
                  {urduErr}
                </div>
              )}
              <label className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-rose-700 cursor-pointer transition">
                <Upload className="h-3.5 w-3.5" />
                Select Payment Slip from Gallery
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── State: Soft Review Fallback (Real slip, minor scan blur) ──────── */}
      {!verified && file && !verifying && allowManual && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <div className="font-semibold text-amber-900">{err || 'Receipt details couldn’t be automatically scanned.'}</div>
              {urduErr && <div className="text-[11px] font-medium text-amber-800" dir="rtl">{urduErr}</div>}
              <div className="text-slate-600 leading-relaxed pt-0.5">
                No problem! Click <strong>&quot;Submit for Manual Review&quot;</strong> below and our team will verify your slip and grant your access.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Button ────────────────────────────────────────────────── */}
      <button
        onClick={submit}
        disabled={submitting || !file || verifying || (!verified && !allowManual)}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.01] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer ${
          verified
            ? 'bg-gradient-to-r from-blue-600 to-cyan-500'
            : isHardRejected
            ? 'bg-slate-400'
            : 'bg-gradient-to-r from-blue-700 to-indigo-600'
        }`}
      >
        {submitting ? (
          <><LoaderCircle className="h-4 w-4 animate-spin" /> Uploading Receipt…</>
        ) : verified ? (
          <><Check className="h-4 w-4" /> Submit Payment Proof &amp; Get Access</>
        ) : isHardRejected ? (
          <><XCircle className="h-4 w-4" /> Please Upload Payment Receipt to Continue</>
        ) : file && allowManual ? (
          <><Upload className="h-4 w-4" /> Submit Proof for Manual Review</>
        ) : (
          <><Upload className="h-4 w-4" /> Select Screenshot to Continue</>
        )}
      </button>

      {/* WhatsApp Help */}
      <a
        href={`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(`Hi! I am on Step 3 (Upload Proof) for the AI Bootcamp${bundleText} and I need help uploading or verifying my payment screenshot.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 py-2.5 px-4 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100/90"
      >
        <MessageCircle className="h-4 w-4 text-emerald-600" /> Facing issue uploading screenshot? Get help on WhatsApp
      </a>

      <button onClick={onBack}
        className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 cursor-pointer">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Shield className="h-3.5 w-3.5" /> Your screenshot is encrypted and stored securely.
      </p>
    </div>
  )
}


// ── Main Enroll Page ───────────────────────────────────────────────────────
export default function EnrollPage() {
  const [step, setStep]   = useState(1)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [userData, setUserDataState] = useState<{
    name: string
    email: string
    whatsapp: string
    totalAmount: number
    selectedUpsells: string[]
  }>({ name: '', email: '', whatsapp: '', totalAmount: BASE_PRICE, selectedUpsells: [] })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'AddToCart', {
          value: BASE_PRICE,
          currency: 'PKR',
          content_name: 'AI Video Bootcamp',
        })
      }
      const params = new URLSearchParams(window.location.search)
      const utm = params.get('utm_source') || params.get('ref')
      const gclid = params.get('gclid')
      const wbraid = params.get('wbraid')
      const gbraid = params.get('gbraid')
      const fbclid = params.get('fbclid')

      // Capture click IDs
      if (gclid && !localStorage.getItem('lead_gclid')) localStorage.setItem('lead_gclid', gclid)
      if (wbraid && !localStorage.getItem('lead_wbraid')) localStorage.setItem('lead_wbraid', wbraid)
      if (gbraid && !localStorage.getItem('lead_gbraid')) localStorage.setItem('lead_gbraid', gbraid)
      if (fbclid && !localStorage.getItem('lead_fbclid')) localStorage.setItem('lead_fbclid', fbclid)

      // Determine lead source
      if (utm) {
        localStorage.setItem('lead_source', utm.toLowerCase())
      } else if (gclid || wbraid || gbraid) {
        localStorage.setItem('lead_source', 'google')
      } else if (fbclid) {
        localStorage.setItem('lead_source', 'facebook')
      } else if (!localStorage.getItem('lead_source') && document.referrer) {
        const ref = document.referrer.toLowerCase()
        if (ref.includes('facebook') || ref.includes('fb.com') || ref.includes('instagram')) localStorage.setItem('lead_source', 'facebook')
        else if (ref.includes('google')) localStorage.setItem('lead_source', 'google')
        else if (ref.includes('tiktok')) localStorage.setItem('lead_source', 'tiktok')
        else if (ref.includes('youtube')) localStorage.setItem('lead_source', 'youtube')
      }
      
      const utmMedium = params.get('utm_medium')
      if (utmMedium) localStorage.setItem('lead_utm_medium', utmMedium)
      
      const utmCampaign = params.get('utm_campaign')
      if (utmCampaign) localStorage.setItem('lead_utm_campaign', utmCampaign)
        
      const utmContent = params.get('utm_content')
      if (utmContent) localStorage.setItem('lead_utm_content', utmContent)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800">
      {/* Universal Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 sm:py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>AI</div>
            <div className="leading-tight">
              <div className="text-xs sm:text-base font-bold tracking-tight text-slate-900">AI Bootcamp</div>
              <div className="-mt-0.5 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Pakistan</div>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition shadow-2xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Course
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-3.5 py-3 sm:px-6 sm:py-6">
        {/* Checkout card */}
        <div className="overflow-hidden rounded-2xl border border-blue-200/60 bg-white shadow-[0_0_40px_rgba(37,99,235,0.08)]">
          {/* Card header bar */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
            </div>
            <div className="text-xs font-medium text-slate-600">Enroll · Step {step} of 3</div>
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <StepBar step={step} />

            {step === 1 && (
              <Step1 onDone={(id, data) => {
                setLeadId(id)
                setUserDataState({
                  name: data.name,
                  email: data.email,
                  whatsapp: data.whatsapp,
                  totalAmount: data.totalAmount,
                  selectedUpsells: data.selectedUpsells,
                })
                setStep(2)
              }} />
            )}
            {step === 2 && (
              <Step2
                userData={userData}
                onContinue={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && leadId && (
              <Step3
                leadId={leadId}
                userData={userData}
                onBack={() => setStep(2)}
              />
            )}
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-600 shadow-2xs">
          <div className="font-semibold text-slate-800">Questions?</div>
          <p className="mt-1 text-slate-500 text-[11px]">
            Email us at <a href="mailto:aivideoboootcamp@gmail.com" className="font-semibold text-blue-600 hover:underline">aivideoboootcamp@gmail.com</a>, WhatsApp us at{' '}
            <a href={`https://wa.me/${WHATSAPP_SUPPORT}`} target="_blank" rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:underline">
              +{WHATSAPP_SUPPORT}
            </a>
            {' '}or see the <Link href="/#reviews" className="font-semibold text-blue-600 hover:underline">FAQs on the homepage</Link>.
          </p>
        </div>
      </main>

      {/* WhatsApp floating */}
      <a href={`https://wa.me/${WHATSAPP_SUPPORT}`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-40 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 sm:h-6 sm:w-6">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 5.834h-.004c-1.271-.05-2.521-.349-3.67-.877l-.263-.119-2.727.716.73-2.66-.172-.273a7.53 7.53 0 0 1-1.16-4.03c0-4.188 3.406-7.592 7.594-7.592 4.188 0 7.592 3.404 7.592 7.592 0 4.188-3.404 7.593-7.592 7.593m6.743-13.831c-1.807-1.808-4.209-2.804-6.765-2.804-5.27 0-9.56 4.29-9.56 9.56 0 1.683.439 3.321 1.271 4.762l-1.351 4.94 5.051-1.324a9.55 9.55 0 0 0 4.589 1.173c5.27 0 9.56-4.29 9.56-9.56 0-2.556-.996-4.958-2.795-6.767" />
        </svg>
      </a>
    </div>
  )
}
