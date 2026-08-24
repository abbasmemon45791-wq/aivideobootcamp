import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle, Clock, MapPin, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Contact Us — AI Bootcamp Pakistan',
  description: 'Get in touch with AI Bootcamp Pakistan support team via email or WhatsApp.',
}

export default function ContactPage() {
  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '923194448530'
  const SUPPORT_EMAIL = 'aivideoboootcamp@gmail.com'

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>AI</div>
            <div className="leading-tight">
              <div className="font-['Sora'] text-sm font-bold tracking-tight sm:text-base">AI Bootcamp</div>
              <div className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Pakistan</div>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
            <ShieldCheck className="h-4 w-4" /> Support & Inquiries
          </div>
          <h1 className="mt-3 font-['Sora'] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Have questions about the bootcamp, enrollment, or course access? We&apos;re here to help.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mb-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 mb-4">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-['Sora'] font-bold text-slate-900 text-base">Email Support</h3>
            <p className="mt-1 text-xs text-slate-500">For general queries, billing, and refund requests.</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-3 inline-block font-medium text-sm text-blue-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h3 className="font-['Sora'] font-bold text-slate-900 text-base">WhatsApp Support</h3>
            <p className="mt-1 text-xs text-slate-500">Fast assistance for payment verification & access.</p>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-medium text-sm text-emerald-600 hover:underline">
              +{WHATSAPP_NUMBER}
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-sm">
          <h3 className="font-['Sora'] font-bold text-slate-900 text-base">Business & Operating Information</h3>
          
          <div className="flex items-start gap-3 text-slate-600">
            <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Support Hours:</strong>
              <p className="text-xs text-slate-500 mt-0.5">Monday to Saturday · 9:00 AM to 9:00 PM PKT (Pakistan Standard Time)</p>
              <p className="text-xs text-slate-500">Expected email response time: Within 24 business hours.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-slate-600 pt-2 border-t border-slate-100">
            <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Location:</strong>
              <p className="text-xs text-slate-500 mt-0.5">Lahore, Punjab, Pakistan</p>
              <p className="text-xs text-slate-500">Online educational training provider.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 px-4 py-8 text-white/70 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg font-bold text-xs text-white" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>AI</div>
            <div className="text-xs font-semibold text-white">AI Bootcamp Pakistan</div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/60 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/refund" className="text-white/60 hover:text-white transition-colors">Refund Policy</Link>
            <Link href="/contact" className="text-white/60 hover:text-white transition-colors">Contact Us</Link>
          </div>
          <div className="text-xs text-white/40">© 2026 AI Bootcamp Pakistan. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
