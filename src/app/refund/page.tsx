import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Mail, MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'Refund Policy — AI Bootcamp Pakistan',
  description: 'Our 100% money-back guarantee and refund policy. Simple, transparent, and hassle-free.',
}

export default function RefundPage() {
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
            <ShieldCheck className="h-4 w-4" /> Transparency & Protection
          </div>
          <h1 className="mt-3 font-['Sora'] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Refund & Cancellation Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last Updated: January 2026 · AI Bootcamp Pakistan
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 mb-8 text-sm leading-relaxed text-slate-700">
          <h3 className="font-['Sora'] font-bold text-slate-900 text-base mb-2">Our Promise to You</h3>
          <p>
            We stand behind the quality and practical depth of our training. If you enroll in AI Bootcamp Pakistan, start learning, and feel the course is not delivering value, we offer a straightforward, no-hassle refund guarantee under the terms detailed below.
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-600">
          <div>
            <h2 className="font-['Sora'] text-xl font-bold text-slate-900 mb-2">1. Refund Eligibility Period</h2>
            <p>
              You are eligible for a 100% full refund within <strong>7 days of enrollment</strong> provided you have not completed more than the first 4 modules of the curriculum. This allows you to evaluate the quality of the teaching and course materials risk-free.
            </p>
          </div>

          <div>
            <h2 className="font-['Sora'] text-xl font-bold text-slate-900 mb-2">2. Conditions for Refund</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>The refund request is submitted within 7 calendar days from your payment date.</li>
              <li>You have accessed 4 modules or fewer inside our Learning Management System.</li>
              <li>You provide your enrollment details (Full Name, Registered Email, and Phone/WhatsApp Number used during checkout).</li>
            </ul>
          </div>

          <div>
            <h2 className="font-['Sora'] text-xl font-bold text-slate-900 mb-2">3. How to Request a Refund</h2>
            <p>
              To initiate a refund, simply reach out to our official support team through either of the following channels:
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 not-prose">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                  <Mail className="h-4 w-4 text-blue-600" /> Email Support
                </div>
                <p className="mt-1 text-xs text-slate-500">Send your request to:</p>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-1 inline-block text-xs font-semibold text-blue-600 hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                  <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp Support
                </div>
                <p className="mt-1 text-xs text-slate-500">Message our team at:</p>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-semibold text-emerald-600 hover:underline">
                  +{WHATSAPP_NUMBER}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-['Sora'] text-xl font-bold text-slate-900 mb-2">4. Processing Time & Method</h2>
            <p>
              Once your refund request is verified, refunds are processed within <strong>3 to 5 business days</strong>. Refunds will be sent back to your original payment method (JazzCash, EasyPaisa, or Bank Account Transfer). You will receive a confirmation receipt via email and WhatsApp once the transfer is completed.
            </p>
          </div>

          <div>
            <h2 className="font-['Sora'] text-xl font-bold text-slate-900 mb-2">5. Course Access Revocation</h2>
            <p>
              Upon successful processing of your refund, access to the LMS video portal, private community, and bonus downloadable assets will be deactivated.
            </p>
          </div>

          <div>
            <h2 className="font-['Sora'] text-xl font-bold text-slate-900 mb-2">6. Contact Us</h2>
            <p>
              If you have any questions or require assistance regarding our policies, our support team is available Monday through Saturday, 9:00 AM – 9:00 PM PKT at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 hover:underline">{SUPPORT_EMAIL}</a>.
            </p>
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
