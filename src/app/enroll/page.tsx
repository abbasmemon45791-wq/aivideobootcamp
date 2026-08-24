'use client'
import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, User, Wallet, Upload, Check,
  Lock, LoaderCircle, Copy, Shield, Image as ImageIcon,
  X, AlertCircle, CheckCircle, ChevronDown, MessageCircle, Star, Sparkles
} from 'lucide-react'

const COURSE_PRICE = 1999
const EASYPAISA_NUMBER = process.env.NEXT_PUBLIC_EASYPAISA_NUMBER ?? '03458996578'
const JAZZCASH_NUMBER  = process.env.NEXT_PUBLIC_JAZZCASH_NUMBER  ?? '03180236635'
const HBL_ACCOUNT      = process.env.NEXT_PUBLIC_HBL_ACCOUNT      ?? '22567902223303'
const ACCOUNT_TITLE    = process.env.NEXT_PUBLIC_ACCOUNT_TITLE    ?? 'Farman Ali'
const WHATSAPP_SUPPORT = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT ?? '923180298090'

const STEP_LABELS: Record<number, string> = { 1: 'Your Details', 2: 'Send Payment', 3: 'Upload Proof' }

// ── Google Ads helpers ──────────────────────────────────────────────────────
// Fires a conversion event, optionally setting Enhanced Conversions user_data
// first. Retries once after 1.5s if gtag hasn't loaded yet (race condition guard).
function gtagSafe(
  params: Record<string, unknown>,
  userData?: { email: string; phone: string }
) {
  const fire = () => {
    if (typeof window === 'undefined' || !(window as any).gtag) return
    if (userData) {
      // Normalise phone to E.164 — must be set BEFORE the conversion event
      const normPhone = userData.phone.replace(/\D/g, '')
      const e164 = normPhone.startsWith('92') ? `+${normPhone}` :
                   normPhone.startsWith('0')  ? `+92${normPhone.slice(1)}` :
                   `+${normPhone}`
      ;(window as any).gtag('set', 'user_data', { email: userData.email, phone_number: e164 })
    }
    ;(window as any).gtag('event', 'conversion', params)
  }
  if (typeof window !== 'undefined' && (window as any).gtag) {
    fire()
  } else {
    setTimeout(fire, 1500)
  }
}

// Keep setUserData as a standalone helper for cases where we need to set
// user identity without firing a conversion (currently unused but kept for clarity)
function setUserData(email: string, phone: string) {
  if (typeof window === 'undefined' || !(window as any).gtag) return
  const normPhone = phone.replace(/\D/g, '')
  const e164 = normPhone.startsWith('92') ? `+${normPhone}` :
               normPhone.startsWith('0')  ? `+92${normPhone.slice(1)}` :
               `+${normPhone}`
  ;(window as any).gtag('set', 'user_data', { email, phone_number: e164 })
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

// ── Step 1 — Details ───────────────────────────────────────────────────────
function Step1({ onDone }: { onDone: (leadId: string, data: { name: string; email: string; whatsapp: string }) => void }) {
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [wa, setWa]         = useState('')
  const [err, setErr]       = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

      // Capture full UTM params for campaign attribution
      const utm_medium = params.get('utm_medium') || localStorage.getItem('lead_utm_medium') || undefined
      const utm_campaign = params.get('utm_campaign') || localStorage.getItem('lead_utm_campaign') || undefined
      const utm_content = params.get('utm_content') || localStorage.getItem('lead_utm_content') || undefined

      // Generate event_id BEFORE the fetch — same value goes to CAPI (via API body) AND fbq()
      const leadEventId = crypto.randomUUID()

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          whatsapp: wa.trim(),
          source,
          utm_medium,
          utm_campaign,
          utm_content,
          // Click IDs — most precise attribution signal; read from localStorage (set on first touch)
          gclid: localStorage.getItem('lead_gclid') || undefined,
          fbclid: localStorage.getItem('lead_fbclid') || undefined,
          eventId: leadEventId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {}, { eventID: leadEventId });
      }

      // Google Ads Lead conversion — user_data set atomically inside gtagSafe
      gtagSafe(
        {
          send_to: `${process.env.NEXT_PUBLIC_GA_ID}/${process.env.NEXT_PUBLIC_GA_LEAD_LABEL}`,
          value: COURSE_PRICE,
          currency: 'PKR',
        },
        { email: email.trim().toLowerCase(), phone: wa.trim() }
      )

      onDone(data.id, { name: name.trim(), email: email.trim().toLowerCase(), whatsapp: wa.trim() })
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-1">
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
        <User className="h-3.5 w-3.5" /> Step 1 of 3
      </div>
      <h2 className="mt-2 font-[&#39;Sora&#39;] text-2xl font-extrabold leading-tight sm:text-3xl"
        style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Reserve Your Seat.
      </h2>
      <p className="text-sm font-semibold text-blue-600">Enroll before price hits Rs {(COURSE_PRICE * 2.75).toLocaleString()}</p>

      <div className="mt-4 space-y-3">
        {/* Full Name */}
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Full Name *</span>
          <input type="text" value={name} onChange={e => setName(e.target.value)} maxLength={100}
            placeholder="e.g. Ali Khan" required
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </label>

        {/* Email */}
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Email *</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={255}
            placeholder="you@example.com" required
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </label>

        {/* WhatsApp */}
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">WhatsApp Number *</span>
          <input type="tel" value={wa} onChange={e => setWa(e.target.value)} maxLength={20}
            placeholder="03XXXXXXXXX" required
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </label>
      </div>

      {err && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {err}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-transform hover:scale-[1.02] disabled:opacity-70"
        style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
        {loading
          ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Saving…</>
          : <>Continue to Payment <ArrowRight className="h-5 w-5" /></>}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
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
    <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 py-4 last:border-0">
      <div className="min-w-0">
        <div className={`text-[11px] font-bold uppercase tracking-wider ${colorClass}`}>{bank}</div>
        {title && <div className="mt-0.5 text-xs text-slate-500">{title}</div>}
        <div className="mt-1 text-sm font-semibold tracking-wide text-slate-800 sm:text-base">{num}</div>
      </div>
      <button onClick={copy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white shadow-sm px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 sm:px-3 sm:py-1.5">
        {copied ? <><Check className="h-4 w-4 text-blue-600 sm:h-3.5 sm:w-3.5" /> Copied</> : <><Copy className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> Copy</>}
      </button>
    </div>
  )
}

// ── Step 2 — Payment ───────────────────────────────────────────────────────
function Step2({
  onContinue,
  onBack,
}: {
  onContinue: () => void
  onBack: () => void
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
        <Wallet className="h-3.5 w-3.5" /> Step 2 of 3
      </div>
      <h2 className="mt-3 font-['Sora'] text-2xl font-extrabold leading-tight sm:text-3xl"
        style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Send Your Payment.
      </h2>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
        <Lock className="h-3.5 w-3.5 text-blue-600" />
        Send <strong className="text-slate-800 mx-1">exactly Rs. {COURSE_PRICE.toLocaleString()}</strong> to any account below.
      </p>

      {/* Social Proof & Trust Header Banner */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3 text-xs text-slate-700">
        <div className="flex items-center gap-1.5 font-medium">
          <div className="flex text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <Star className="h-3.5 w-3.5 fill-amber-400" />
          </div>
          <span className="font-bold text-slate-900">4.9/5</span>
          <span className="text-slate-500">(1,120+ Enrolled)</span>
        </div>
      </div>

      {/* Payment Options */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
        <BankRow bank="EasyPaisa" title={ACCOUNT_TITLE} num={EASYPAISA_NUMBER} colorClass="text-emerald-600" />
        {JAZZCASH_NUMBER && <BankRow bank="JazzCash" num={JAZZCASH_NUMBER} colorClass="text-rose-600" />}
        {HBL_ACCOUNT && <BankRow bank="HBL (Bank Transfer)" title={ACCOUNT_TITLE} num={HBL_ACCOUNT} colorClass="text-teal-700" />}
      </div>

      {/* Direct WhatsApp Support Assistance Button */}
      <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-left shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-white shadow-md">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Having trouble paying or need help?</h4>
            <p className="mt-0.5 text-xs text-slate-600">
              Our team is online right now to assist you step-by-step on WhatsApp.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent("Hi! I am on Step 2 (Payment) for the AI Bootcamp and I need help completing my payment.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" /> Facing Issue? Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <button onClick={onContinue}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-transform hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
        I&apos;ve Sent the Payment — Continue <ArrowRight className="h-5 w-5" />
      </button>
      <button onClick={onBack}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Lock className="h-3.5 w-3.5" /> Secure · One-time payment · Lifetime access
      </p>
    </div>
  )
}

// ── Step 3 — Upload Proof ──────────────────────────────────────────────────
function Step3({
  leadId,
  onBack,
  userData,
}: {
  leadId: string
  onBack: () => void
  userData: { email: string; whatsapp: string }
}) {
  const router = useRouter()
  const [file, setFile]           = useState<File | null>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [verified, setVerified]   = useState(false)
  const [verifyResult, setVerifyResult] = useState<Record<string, unknown> | null>(null)
  const [imageHash, setImageHash] = useState<string | null>(null)
  const [err, setErr]             = useState<string | null>(null)
  const [done, setDone]           = useState(false)

  const handleFile = useCallback(async (f: File | null | undefined) => {
    if (!f) return
    setErr(null); setVerified(false); setVerifyResult(null); setImageHash(null); setPreview(null)

    if (!f.type.startsWith('image/'))
      return setErr('Please upload an image file (PNG, JPG, etc.)')
    if (f.size > 5 * 1024 * 1024)
      return setErr('Image must be under 5MB.')

    setFile(f)
    setPreview(URL.createObjectURL(f))
    setVerifying(true)

    try {
      const base64 = await compressImageToBase64(f)
      const res = await fetch('/api/verify-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: base64, contentType: f.type, localTime: new Date().toString() }),
      })
      const data = await res.json()
      setVerifyResult(data)
      if (data.valid) {
        setVerified(true)
        setImageHash(data.imageHash)
      } else {
        setErr(data.reason ?? 'Screenshot could not be verified. Please upload a clear, unedited screenshot from your EasyPaisa/JazzCash app.')
      }
    } catch {
      setErr('Verification failed. Please try again or contact support.')
    } finally {
      setVerifying(false)
    }
  }, [])

  const submit = async () => {
    if (!file || !verified) return
    setSubmitting(true); setErr(null)

    try {
      const base64 = await compressImageToBase64(file)

      // Generate event_id BEFORE the fetch — same value goes to CAPI (via API body) AND fbq()
      const purchaseEventId = crypto.randomUUID()

      const res = await fetch('/api/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId, fileBase64: base64, contentType: 'image/jpeg', fileName: file.name,
          imageHash, aiResult: verifyResult,
          transactionId: (verifyResult as Record<string,unknown>)?.transactionId,
          amount: (verifyResult as Record<string,unknown>)?.amount,
          recipientNumber: (verifyResult as Record<string,unknown>)?.recipientNumber,
          senderName: (verifyResult as Record<string,unknown>)?.senderName,
          direction: (verifyResult as Record<string,unknown>)?.direction,
          eventId: purchaseEventId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Purchase', { value: COURSE_PRICE, currency: 'PKR' }, { eventID: purchaseEventId });
      }

      // Google Ads Purchase conversion — user_data set atomically inside gtagSafe
      gtagSafe(
        {
          send_to: `${process.env.NEXT_PUBLIC_GA_ID}/${process.env.NEXT_PUBLIC_GA_PURCHASE_LABEL}`,
          value: COURSE_PRICE,
          currency: 'PKR',
          transaction_id: (verifyResult as Record<string,unknown>)?.transactionId ?? '',
        },
        { email: userData.email, phone: userData.whatsapp }
      )

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
          Payment screenshot received! Message us on WhatsApp now — we&apos;ll send you the final student form there so you can complete your enrollment.
        </p>
        <a href={`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(`Hi! I've submitted my payment for the AI Bootcamp. My name is [Your Name]. Please confirm my enrollment.`)}`}
          target="_blank" rel="noopener noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]">
          <MessageCircle className="h-5 w-5" />
          Message us on WhatsApp
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
        <Upload className="h-3.5 w-3.5" /> Step 3 of 3
      </div>
      <h2 className="mt-3 font-[&#39;Sora&#39;] text-2xl font-extrabold leading-tight sm:text-3xl"
        style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Upload Payment Screenshot.
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Upload a clear screenshot of your Rs. {COURSE_PRICE.toLocaleString()} payment. Image only, max 5MB.
      </p>

      {/* Drop zone */}
      <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
        {preview
          ? <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
          : <>
              <ImageIcon className="h-8 w-8 text-slate-300" />
              <div className="text-sm font-medium text-slate-600">Tap to choose screenshot</div>
              <div className="text-xs text-slate-400">PNG or JPG · up to 5MB</div>
            </>}
        <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      </label>

      {file && <div className="mt-2 truncate text-xs text-slate-400">Selected: <span className="text-slate-600">{file.name}</span></div>}

      {/* Verifying */}
      {verifying && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
          <LoaderCircle className="h-4 w-4 animate-spin text-blue-600" /> Verifying payment screenshot with AI…
        </div>
      )}

      {/* Verified */}
      {verified && !verifying && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <CheckCircle className="h-4 w-4" /> Payment screenshot verified ✓
        </div>
      )}

      {/* Error */}
      {err && !verifying && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{err}</span>
          </div>
          <a href={`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent('My payment screenshot is being rejected. Can you verify manually?')}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1.5 font-semibold text-emerald-600 hover:underline">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 5.834h-.004c-1.271-.05-2.521-.349-3.67-.877l-.263-.119-2.727.716.73-2.66-.172-.273a7.53 7.53 0 0 1-1.16-4.03c0-4.188 3.406-7.592 7.594-7.592 4.188 0 7.592 3.404 7.592 7.592 0 4.188-3.404 7.593-7.592 7.593m6.743-13.831c-1.807-1.808-4.209-2.804-6.765-2.804-5.27 0-9.56 4.29-9.56 9.56 0 1.683.439 3.321 1.271 4.762l-1.351 4.94 5.051-1.324a9.55 9.55 0 0 0 4.589 1.173c5.27 0 9.56-4.29 9.56-9.56 0-2.556-.996-4.958-2.795-6.767" />
            </svg>
            Screenshot issue? Get verified manually on WhatsApp
          </a>
        </div>
      )}

      <button onClick={submit} disabled={submitting || !verified}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
        {submitting
          ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Uploading…</>
          : <><Upload className="h-4 w-4" /> Submit Payment Proof</>}
      </button>

      <a
        href={`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent("Hi! I am on Step 3 (Upload Proof) for the AI Bootcamp and I need help uploading or verifying my payment screenshot.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 py-2.5 px-4 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100/90"
      >
        <MessageCircle className="h-4 w-4 text-emerald-600" /> Facing issue uploading screenshot? Get help on WhatsApp
      </a>

      <button onClick={onBack}
        className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Shield className="h-3.5 w-3.5" /> Your screenshot is encrypted and stored securely.
      </p>
    </div>
  )
}

// ── Util ───────────────────────────────────────────────────────────────────
function compressImageToBase64(file: File, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
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
        if (!ctx) return reject('No canvas context')
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl.split(',')[1])
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Main Enroll Page ───────────────────────────────────────────────────────
export default function EnrollPage() {
  const [step, setStep]   = useState(1)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [userData, setUserDataState] = useState<{ email: string; whatsapp: string }>({ email: '', whatsapp: '' })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'InitiateCheckout')
      }
      // Also capture source on direct enroll page visits
      const params = new URLSearchParams(window.location.search)
      const utm = params.get('utm_source') || params.get('ref')
      if (utm) {
        localStorage.setItem('lead_source', utm.toLowerCase())
      } else if (!localStorage.getItem('lead_source') && document.referrer) {
        const ref = document.referrer.toLowerCase()
        if (ref.includes('facebook') || ref.includes('fb.com') || ref.includes('instagram')) localStorage.setItem('lead_source', 'facebook')
        else if (ref.includes('google')) localStorage.setItem('lead_source', 'google')
      }
      
      const utmMedium = params.get('utm_medium')
      if (utmMedium) localStorage.setItem('lead_utm_medium', utmMedium)
      
      const utmCampaign = params.get('utm_campaign')
      if (utmCampaign) localStorage.setItem('lead_utm_campaign', utmCampaign)
        
      const utmContent = params.get('utm_content')
      if (utmContent) localStorage.setItem('lead_utm_content', utmContent)

      // Capture click IDs — most precise attribution signal from each ad platform
      // Only store on first touch; never overwrite (preserve the original paid click)
      const gclid = params.get('gclid')
      if (gclid && !localStorage.getItem('lead_gclid')) {
        localStorage.setItem('lead_gclid', gclid)
        if (!localStorage.getItem('lead_source')) localStorage.setItem('lead_source', 'google')
      }

      const fbclid = params.get('fbclid')
      if (fbclid && !localStorage.getItem('lead_fbclid')) {
        localStorage.setItem('lead_fbclid', fbclid)
        if (!localStorage.getItem('lead_source')) localStorage.setItem('lead_source', 'facebook')
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>AI</div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight sm:text-base">AI Bootcamp</div>
              <div className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Pakistan</div>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Back to Course
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 sm:px-6 sm:py-8">
        {/* Checkout card */}
        <div className="overflow-hidden rounded-2xl border border-blue-200/60 bg-white shadow-[0_0_40px_rgba(37,99,235,0.1)]">
          {/* Card header bar */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            </div>
            <div className="text-xs font-medium text-slate-500">Enroll · Step {step} of 3</div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" /> Live
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <StepBar step={step} />

            {step === 1 && (
              <Step1 onDone={(id, data) => {
                setLeadId(id)
                setUserDataState({ email: data.email, whatsapp: data.whatsapp })
                setStep(2)
              }} />
            )}
            {step === 2 && (
              <Step2
                onContinue={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && leadId && (
              <Step3 leadId={leadId} onBack={() => setStep(2)} userData={userData} />
            )}
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <div className="font-semibold text-slate-800">Questions?</div>
          <p className="mt-1 text-xs">
            WhatsApp us at{' '}
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
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 5.834h-.004c-1.271-.05-2.521-.349-3.67-.877l-.263-.119-2.727.716.73-2.66-.172-.273a7.53 7.53 0 0 1-1.16-4.03c0-4.188 3.406-7.592 7.594-7.592 4.188 0 7.592 3.404 7.592 7.592 0 4.188-3.404 7.593-7.592 7.593m6.743-13.831c-1.807-1.808-4.209-2.804-6.765-2.804-5.27 0-9.56 4.29-9.56 9.56 0 1.683.439 3.321 1.271 4.762l-1.351 4.94 5.051-1.324a9.55 9.55 0 0 0 4.589 1.173c5.27 0 9.56-4.29 9.56-9.56 0-2.556-.996-4.958-2.795-6.767" />
        </svg>
      </a>
    </div>
  )
}
