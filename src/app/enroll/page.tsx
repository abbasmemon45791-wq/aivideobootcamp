'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, User, Wallet, Upload, Check,
  Lock, LoaderCircle, Copy, Shield, Image as ImageIcon,
  X, AlertCircle, CheckCircle, ChevronDown
} from 'lucide-react'

const COURSE_PRICE = 2900
const EASYPAISA_NUMBER = process.env.NEXT_PUBLIC_EASYPAISA_NUMBER ?? '03458996578'
const JAZZCASH_NUMBER  = process.env.NEXT_PUBLIC_JAZZCASH_NUMBER  ?? '03180236635'
const HBL_ACCOUNT      = process.env.NEXT_PUBLIC_HBL_ACCOUNT      ?? '22567902223303'
const ACCOUNT_TITLE    = process.env.NEXT_PUBLIC_ACCOUNT_TITLE    ?? 'Farman Ali'
const WHATSAPP_SUPPORT = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT ?? '923180298090'

const STEP_LABELS: Record<number, string> = { 1: 'Your Details', 2: 'Send Payment', 3: 'Upload Proof' }

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
function Step1({ onDone }: { onDone: (leadId: string, data: { name: string; email: string }) => void }) {
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
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), whatsapp: wa.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onDone(data.id, { name: name.trim(), email: email.trim() })
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

// ── CopyField helper ───────────────────────────────────────────────────────
function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-slate-400">{label}</div>
        <div className="truncate font-semibold text-slate-800">{value}</div>
      </div>
      <button onClick={copy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100">
        {copied ? <><Check className="h-3.5 w-3.5 text-blue-600" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
      </button>
    </div>
  )
}

// ── Step 2 — Payment ───────────────────────────────────────────────────────
function Step2({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
        <Wallet className="h-3.5 w-3.5" /> Step 2 of 3
      </div>
      <h2 className="mt-3 font-[&#39;Sora&#39;] text-2xl font-extrabold leading-tight sm:text-3xl"
        style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Send Your Payment.
      </h2>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
        <Lock className="h-3.5 w-3.5 text-blue-600" />
        Send <strong className="text-slate-800 mx-1">exactly Rs. {COURSE_PRICE.toLocaleString()}</strong> (or nearest round figure) to the account below.
      </p>

      {/* EasyPaisa */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4">
        <div className="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">EasyPaisa</div>
        <CopyField label="Account Title" value={ACCOUNT_TITLE} />
        <CopyField label="Account Number" value={EASYPAISA_NUMBER} />
        <CopyField label="Amount" value={`Rs. ${COURSE_PRICE.toLocaleString()}`} />
      </div>

      {JAZZCASH_NUMBER && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4">
          <div className="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">JazzCash</div>
          <CopyField label="Account Number" value={JAZZCASH_NUMBER} />
          <CopyField label="Amount" value={`Rs. ${COURSE_PRICE.toLocaleString()}`} />
        </div>
      )}

      {HBL_ACCOUNT && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4">
          <div className="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">HBL (Bank Transfer)</div>
          <CopyField label="Account Title" value={ACCOUNT_TITLE} />
          <CopyField label="Account Number" value={HBL_ACCOUNT} />
          <CopyField label="Amount" value={`Rs. ${COURSE_PRICE.toLocaleString()}`} />
        </div>
      )}

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
        <span className="font-semibold">Note:</span> Sending Rs. 2,950 or Rs. 3,000 is also fine — we verify the recipient account number, not the exact amount.
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
function Step3({ leadId, onBack }: { leadId: string; onBack: () => void }) {
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
      const base64 = await fileToBase64(f)
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
      const base64 = await fileToBase64(file)
      const res = await fetch('/api/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId, fileBase64: base64, contentType: file.type, fileName: file.name,
          imageHash, aiResult: verifyResult,
          transactionId: (verifyResult as Record<string,unknown>)?.transactionId,
          amount: (verifyResult as Record<string,unknown>)?.amount,
          recipientNumber: (verifyResult as Record<string,unknown>)?.recipientNumber,
          senderName: (verifyResult as Record<string,unknown>)?.senderName,
          direction: (verifyResult as Record<string,unknown>)?.direction,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
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
        <h2 className="mt-4 font-[&#39;Sora&#39;] text-2xl font-extrabold"
          style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          You&apos;re In! 🎉
        </h2>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
          Payment screenshot received! Our team will verify it within <strong>1 hour</strong>.
          You&apos;ll receive your access link on <strong>WhatsApp & email</strong>.
        </p>
        <a href={`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(`Hi! I've submitted my payment for the AI Bootcamp. My name is [Your Name]. Please confirm my enrollment.`)}`}
          target="_blank" rel="noopener noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 5.834h-.004c-1.271-.05-2.521-.349-3.67-.877l-.263-.119-2.727.716.73-2.66-.172-.273a7.53 7.53 0 0 1-1.16-4.03c0-4.188 3.406-7.592 7.594-7.592 4.188 0 7.592 3.404 7.592 7.592 0 4.188-3.404 7.593-7.592 7.593m6.743-13.831c-1.807-1.808-4.209-2.804-6.765-2.804-5.27 0-9.56 4.29-9.56 9.56 0 1.683.439 3.321 1.271 4.762l-1.351 4.94 5.051-1.324a9.55 9.55 0 0 0 4.589 1.173c5.27 0 9.56-4.29 9.56-9.56 0-2.556-.996-4.958-2.795-6.767" />
          </svg>
          Confirm on WhatsApp
        </a>
        <Link href="/" className="mt-3 block text-sm text-slate-400 hover:text-slate-600">← Back to Home</Link>
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

      <button onClick={onBack}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Shield className="h-3.5 w-3.5" /> Your screenshot is encrypted and stored securely.
      </p>
    </div>
  )
}

// ── Util ───────────────────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Main Enroll Page ───────────────────────────────────────────────────────
export default function EnrollPage() {
  const [step, setStep]   = useState(1)
  const [leadId, setLeadId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>AI</div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight sm:text-base">TechPulse</div>
              <div className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">AI Bootcamp</div>
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
              <Step1 onDone={(id) => { setLeadId(id); setStep(2) }} />
            )}
            {step === 2 && (
              <Step2 onContinue={() => setStep(3)} onBack={() => setStep(1)} />
            )}
            {step === 3 && leadId && (
              <Step3 leadId={leadId} onBack={() => setStep(2)} />
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
