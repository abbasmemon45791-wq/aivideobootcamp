'use client'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl text-white font-bold text-sm shadow-sm" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>AI</div>
            <div className="leading-tight">
              <div className="font-['Sora'] text-sm font-bold tracking-tight sm:text-base">AI Bootcamp</div>
              <div className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Pakistan</div>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="font-['Sora'] text-3xl font-bold text-slate-900">Terms of Service</h1>
            <p className="text-sm text-slate-500">Last updated: August 16, 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:font-['Sora'] prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-relaxed prose-li:leading-relaxed">

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the AI Bootcamp Pakistan website and services (&quot;Services&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree with any part of these Terms, you must not use our Services.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            AI Bootcamp Pakistan provides pre-recorded online training courses focused on AI creative skills, including AI video generation, AI image creation, prompt engineering, and related digital skills. The course content is delivered through our learning management system (LMS) and community platform.
          </p>

          <h2>3. Enrollment &amp; Payment</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Enrollment requires providing your name, email, and WhatsApp number, followed by payment via JazzCash, EasyPaisa, or bank transfer</li>
            <li>Payment is verified manually through screenshot review. Access is granted only after successful verification</li>
            <li>All prices are listed in Pakistani Rupees (PKR) unless stated otherwise</li>
            <li>The enrollment fee is a one-time payment that grants lifetime access to the course content available at the time of purchase, plus any future updates</li>
          </ul>

          <h2>4. Earnings Disclaimer</h2>
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5 not-prose">
            <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ Important Disclaimer</p>
            <p className="text-sm text-amber-700 leading-relaxed">
              AI Bootcamp Pakistan is an educational service that teaches AI creative skills. <strong>We do not guarantee any specific income, earnings, or financial results.</strong> Any income examples, figures, or testimonials shared on our website, social media, or marketing materials represent the results of individual students and are not typical. Your results will vary based on your effort, skills, experience, market conditions, and many other factors outside our control.
            </p>
            <p className="text-sm text-amber-700 leading-relaxed mt-2">
              References to earning potential or income opportunities are provided for educational and illustrative purposes only. They should not be construed as a guarantee or promise of actual earnings. Success in any business or freelance endeavor requires hard work, dedication, and is not guaranteed by completing this course.
            </p>
          </div>

          <h2>5. Refund Policy</h2>
          <p>
            We offer a conditional refund under the following terms:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>If after watching the first 4 modules you do not find value in the course, you may request a full refund</li>
            <li>Refund requests must be made within the eligible refund window after enrollment</li>
            <li>To request a refund, contact us via WhatsApp at <a href="https://wa.me/923194448530" className="text-blue-600 hover:underline">+92 319 4448530</a></li>
            <li>Refunds will be processed within 7–10 business days via the same payment method used for enrollment</li>
            <li>No refunds will be issued after the eligible refund period or after accessing more than 50% of the course content</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            All course content, including but not limited to videos, text, images, graphics, prompts, templates, and downloadable resources, is the intellectual property of AI Bootcamp Pakistan and is protected by copyright law. You may not reproduce, distribute, modify, or share any course materials without our explicit written permission.
          </p>

          <h2>7. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You agree to provide accurate and truthful information during enrollment</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You agree not to share, resell, or redistribute course materials</li>
            <li>You agree not to submit fraudulent payment screenshots or impersonate other users</li>
          </ul>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, AI Bootcamp Pakistan shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our Services. Our total liability shall not exceed the amount you paid for enrollment.
          </p>

          <h2>9. Third-Party Services</h2>
          <p>
            Our course references third-party tools and platforms (such as Midjourney, Runway, ElevenLabs, CapCut, etc.). We are not affiliated with, endorsed by, or responsible for these third-party services. Their use is subject to their own terms of service and pricing, which may change without notice.
          </p>

          <h2>10. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on this page. The &quot;Last updated&quot; date will be revised accordingly. Continued use of our Services after changes constitutes acceptance of the updated Terms.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Pakistan. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Pakistan.
          </p>

          <h2>12. Contact Us</h2>
          <p>If you have any questions about these Terms of Service, please contact us:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email: <a href="mailto:aivideoboootcamp@gmail.com" className="text-blue-600 hover:underline">aivideoboootcamp@gmail.com</a></li>
            <li>WhatsApp: <a href="https://wa.me/923194448530" className="text-blue-600 hover:underline">+92 319 4448530</a></li>
          </ul>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-900 px-4 py-10 text-white/70 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>AI</div>
            <div className="font-['Sora'] text-sm font-bold text-white">AI Bootcamp Pakistan</div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link href="/privacy" className="text-white/60 hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="text-white/60 hover:text-white">Terms of Service</Link>
            <Link href="/refund" className="text-white/60 hover:text-white">Refund Policy</Link>
            <Link href="/contact" className="text-white/60 hover:text-white">Contact Us</Link>
            <span className="text-white/40">© 2026 AI Bootcamp Pakistan. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
